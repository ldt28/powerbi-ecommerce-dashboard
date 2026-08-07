import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Unlink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BigCommerceSetup() {
  const [storeHash, setStoreHash] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Queries
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = 
    trpc.bigcommerce.getStatus.useQuery();
  const { data: salesSummary } = trpc.bigcommerce.getSalesSummary.useQuery(
    undefined,
    { enabled: status?.connected }
  );
  const { data: topProducts } = trpc.bigcommerce.getTopProducts.useQuery(
    { limit: 5 },
    { enabled: status?.connected }
  );
  const { data: inventory } = trpc.bigcommerce.getInventory.useQuery(
    undefined,
    { enabled: status?.connected }
  );
  const { data: customerCount } = trpc.bigcommerce.getCustomerCount.useQuery(
    undefined,
    { enabled: status?.connected }
  );

  // Mutations
  const connectMutation = trpc.bigcommerce.connect.useMutation();
  const disconnectMutation = trpc.bigcommerce.disconnect.useMutation();
  const syncMutation = trpc.bigcommerce.syncOrders.useMutation();

  const handleConnect = async () => {
    if (!storeHash.trim() || !accessToken.trim()) {
      alert("Please enter both Store Hash and Access Token");
      return;
    }

    try {
      await connectMutation.mutateAsync({
        storeHash: storeHash.trim(),
        accessToken: accessToken.trim(),
      });
      setStoreHash("");
      setAccessToken("");
      setConnectDialogOpen(false);
      refetchStatus();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect BigCommerce?")) return;
    try {
      await disconnectMutation.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      refetchStatus();
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">BigCommerce Integration</h1>
        <p className="text-muted-foreground mb-8">Connect your BigCommerce store to sync live sales and inventory data</p>

        {/* Connection Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Loading...</span>
              </div>
            ) : status?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Connected to {status.storeName}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last synced: {status.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : "Never"}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSync} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                    Sync Now
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnect} disabled={disconnectMutation.isPending}>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>Not connected</span>
                </div>
                <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Connect BigCommerce</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Connect BigCommerce</DialogTitle>
                      <DialogDescription>
                        Enter your BigCommerce API credentials to connect your store
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Find your credentials in BigCommerce Settings → API Accounts
                        </AlertDescription>
                      </Alert>

                      <div>
                        <label className="text-sm font-medium">Store Hash</label>
                        <Input
                          placeholder="e.g., abc123def"
                          value={storeHash}
                          onChange={(e) => setStoreHash(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Your store's unique identifier</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Access Token</label>
                        <div className="flex gap-2">
                          <Input
                            type={showToken ? "text" : "password"}
                            placeholder="v3_..."
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowToken(!showToken)}
                          >
                            {showToken ? "Hide" : "Show"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Your API access token (starts with v3_)</p>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConnect}
                          disabled={connectMutation.isPending}
                        >
                          {connectMutation.isPending ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          ) : null}
                          Connect
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Data Display */}
        {status?.connected && (
          <>
            {/* Sales Summary */}
            {salesSummary && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                  <CardDescription>Live data from your BigCommerce store</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-accent">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        {salesSummary.currencyCode} {salesSummary.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent">
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{salesSummary.totalOrders}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent">
                      <p className="text-sm text-muted-foreground">Average Order Value</p>
                      <p className="text-2xl font-bold">
                        {salesSummary.currencyCode} {salesSummary.averageOrderValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Products */}
            {topProducts && topProducts.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products by revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topProducts.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg border">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                        </div>
                        <p className="font-bold">${product.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory & Customers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventory && inventory.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Products</span>
                        <span className="font-bold">{inventory.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Stock</span>
                        <span className="font-bold text-green-600">
                          {inventory.filter((i: any) => i.status === "in_stock").length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Low Stock</span>
                        <span className="font-bold text-yellow-600">
                          {inventory.filter((i: any) => i.status === "low_stock").length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No inventory data</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerCount ? (
                    <div>
                      <p className="text-muted-foreground">Total Customers</p>
                      <p className="text-3xl font-bold">{customerCount.count}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No customer data</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
