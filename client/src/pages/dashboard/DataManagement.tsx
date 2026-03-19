import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState<"sales" | "ads" | "credentials">("sales");
  const [salesForm, setSalesForm] = useState({
    orderId: "",
    marketplace: "Amazon",
    productSku: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    revenue: 0,
    cogs: 0,
    orderDate: new Date().toISOString().split("T")[0],
  });

  const [adsForm, setAdsForm] = useState({
    marketplace: "Amazon",
    adSpend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenueFromAds: 0,
    date: new Date().toISOString().split("T")[0],
  });

  const [credentialsForm, setCredentialsForm] = useState({
    marketplace: "Amazon",
    apiKey: "",
    apiSecret: "",
  });

  const addSalesMutation = trpc.dashboard.addSalesData.useMutation();
  const addAdsMutation = trpc.dashboard.addAdSpendData.useMutation();
  const addCredentialsMutation = trpc.apiCredentials.add.useMutation();

  const handleAddSales = async () => {
    try {
      await addSalesMutation.mutateAsync({
        ...salesForm,
        quantity: parseInt(salesForm.quantity as any),
        unitPrice: parseFloat(salesForm.unitPrice as any),
        revenue: parseFloat(salesForm.revenue as any),
        cogs: parseFloat(salesForm.cogs as any),
        orderDate: new Date(salesForm.orderDate),
      });
      toast.success("Sales data added successfully");
      setSalesForm({
        orderId: "",
        marketplace: "Amazon",
        productSku: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        revenue: 0,
        cogs: 0,
        orderDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Failed to add sales data");
    }
  };

  const handleAddAds = async () => {
    try {
      await addAdsMutation.mutateAsync({
        ...adsForm,
        adSpend: parseFloat(adsForm.adSpend as any),
        impressions: parseInt(adsForm.impressions as any),
        clicks: parseInt(adsForm.clicks as any),
        conversions: parseInt(adsForm.conversions as any),
        revenueFromAds: parseFloat(adsForm.revenueFromAds as any),
        date: new Date(adsForm.date),
      });
      toast.success("Ad spend data added successfully");
      setAdsForm({
        marketplace: "Amazon",
        adSpend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenueFromAds: 0,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Failed to add ad spend data");
    }
  };

  const handleAddCredentials = async () => {
    try {
      await addCredentialsMutation.mutateAsync(credentialsForm);
      toast.success("API credentials added successfully");
      setCredentialsForm({
        marketplace: "Amazon",
        apiKey: "",
        apiSecret: "",
      });
    } catch (error) {
      toast.error("Failed to add API credentials");
    }
  };

  const marketplaces = ["Amazon", "eBay", "BigCommerce", "Walmart", "AutoZone", "Tractor Supply", "Northern Tools", "Lowes"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-gray-500 mt-2">Upload data, add manual entries, and manage API credentials</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 font-medium ${activeTab === "sales" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Add Sales Data
        </button>
        <button
          onClick={() => setActiveTab("ads")}
          className={`px-4 py-2 font-medium ${activeTab === "ads" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Add Ad Spend
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-4 py-2 font-medium ${activeTab === "credentials" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          API Credentials
        </button>
      </div>

      {/* Sales Data Form */}
      {activeTab === "sales" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Sales Data</CardTitle>
            <CardDescription>Manually enter sales data from your orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Order ID</Label>
                <Input value={salesForm.orderId} onChange={(e) => setSalesForm({ ...salesForm, orderId: e.target.value })} placeholder="ORD-123456" />
              </div>
              <div>
                <Label>Marketplace</Label>
                <select
                  value={salesForm.marketplace}
                  onChange={(e) => setSalesForm({ ...salesForm, marketplace: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {marketplaces.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Product SKU</Label>
                <Input value={salesForm.productSku} onChange={(e) => setSalesForm({ ...salesForm, productSku: e.target.value })} placeholder="SKU-123" />
              </div>
              <div>
                <Label>Product Name</Label>
                <Input value={salesForm.productName} onChange={(e) => setSalesForm({ ...salesForm, productName: e.target.value })} placeholder="Product Name" />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" value={salesForm.quantity} onChange={(e) => setSalesForm({ ...salesForm, quantity: e.target.value as any })} />
              </div>
              <div>
                <Label>Unit Price</Label>
                <Input type="number" step="0.01" value={salesForm.unitPrice} onChange={(e) => setSalesForm({ ...salesForm, unitPrice: e.target.value as any })} />
              </div>
              <div>
                <Label>Revenue</Label>
                <Input type="number" step="0.01" value={salesForm.revenue} onChange={(e) => setSalesForm({ ...salesForm, revenue: e.target.value as any })} />
              </div>
              <div>
                <Label>COGS</Label>
                <Input type="number" step="0.01" value={salesForm.cogs} onChange={(e) => setSalesForm({ ...salesForm, cogs: e.target.value as any })} />
              </div>
              <div>
                <Label>Order Date</Label>
                <Input type="date" value={salesForm.orderDate} onChange={(e) => setSalesForm({ ...salesForm, orderDate: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleAddSales} disabled={addSalesMutation.isPending} className="w-full">
              {addSalesMutation.isPending ? "Adding..." : "Add Sales Data"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ad Spend Form */}
      {activeTab === "ads" && (
        <Card>
          <CardHeader>
            <CardTitle>Add Ad Spend Data</CardTitle>
            <CardDescription>Enter your daily ad spend and performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Marketplace</Label>
                <select
                  value={adsForm.marketplace}
                  onChange={(e) => setAdsForm({ ...adsForm, marketplace: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {marketplaces.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Ad Spend</Label>
                <Input type="number" step="0.01" value={adsForm.adSpend} onChange={(e) => setAdsForm({ ...adsForm, adSpend: e.target.value as any })} />
              </div>
              <div>
                <Label>Impressions</Label>
                <Input type="number" value={adsForm.impressions} onChange={(e) => setAdsForm({ ...adsForm, impressions: e.target.value as any })} />
              </div>
              <div>
                <Label>Clicks</Label>
                <Input type="number" value={adsForm.clicks} onChange={(e) => setAdsForm({ ...adsForm, clicks: e.target.value as any })} />
              </div>
              <div>
                <Label>Conversions</Label>
                <Input type="number" value={adsForm.conversions} onChange={(e) => setAdsForm({ ...adsForm, conversions: e.target.value as any })} />
              </div>
              <div>
                <Label>Revenue from Ads</Label>
                <Input type="number" step="0.01" value={adsForm.revenueFromAds} onChange={(e) => setAdsForm({ ...adsForm, revenueFromAds: e.target.value as any })} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={adsForm.date} onChange={(e) => setAdsForm({ ...adsForm, date: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleAddAds} disabled={addAdsMutation.isPending} className="w-full">
              {addAdsMutation.isPending ? "Adding..." : "Add Ad Spend Data"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Credentials Form */}
      {activeTab === "credentials" && (
        <Card>
          <CardHeader>
            <CardTitle>API Credentials</CardTitle>
            <CardDescription>Add API credentials to automatically sync data from your marketplaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Marketplace</Label>
                <select
                  value={credentialsForm.marketplace}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, marketplace: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {marketplaces.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={credentialsForm.apiKey}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, apiKey: e.target.value })}
                  placeholder="Enter API key"
                />
              </div>
              <div className="md:col-span-2">
                <Label>API Secret</Label>
                <Input
                  type="password"
                  value={credentialsForm.apiSecret}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, apiSecret: e.target.value })}
                  placeholder="Enter API secret"
                />
              </div>
            </div>
            <Button onClick={handleAddCredentials} disabled={addCredentialsMutation.isPending} className="w-full">
              {addCredentialsMutation.isPending ? "Adding..." : "Add API Credentials"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
