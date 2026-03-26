import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function DataManagement() {
  const [activeTab, setActiveTab] = useState<"import" | "sales" | "ads" | "credentials" | "logs">("import");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvType, setCsvType] = useState<"sales" | "ads">("sales");
  const [isUploading, setIsUploading] = useState(false);

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

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setIsUploading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error("CSV file must have headers and at least one data row");
        setIsUploading(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      let successCount = 0;
      let errorCount = 0;

      if (csvType === "sales") {
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
          });

          try {
            await addSalesMutation.mutateAsync({
              orderId: row["order_id"] || row["orderid"] || `ORD-${Date.now()}`,
              marketplace: row["marketplace"] || "Amazon",
              productSku: row["product_sku"] || row["sku"] || "",
              productName: row["product_name"] || row["name"] || "",
              quantity: parseInt(row["quantity"] || "1"),
              unitPrice: parseFloat(row["unit_price"] || row["price"] || "0"),
              revenue: parseFloat(row["revenue"] || row["total"] || "0"),
              cogs: parseFloat(row["cogs"] || row["cost"] || "0"),
              orderDate: new Date(row["order_date"] || row["date"] || new Date()),
            });
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      } else {
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
          });

          try {
            await addAdsMutation.mutateAsync({
              marketplace: row["marketplace"] || "Amazon",
              adSpend: parseFloat(row["ad_spend"] || row["spend"] || "0"),
              impressions: parseInt(row["impressions"] || "0"),
              clicks: parseInt(row["clicks"] || "0"),
              conversions: parseInt(row["conversions"] || "0"),
              revenueFromAds: parseFloat(row["revenue_from_ads"] || row["revenue"] || "0"),
              date: new Date(row["date"] || new Date()),
            });
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      }

      toast.success(`Imported ${successCount} records${errorCount > 0 ? ` (${errorCount} errors)` : ""}`);
      setCsvFile(null);
    } catch (error) {
      toast.error("Failed to parse CSV file");
    } finally {
      setIsUploading(false);
    }
  };

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
      <div className="flex gap-4 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("import")}
          className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "import" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Import CSV
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "sales" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Add Sales Data
        </button>
        <button
          onClick={() => setActiveTab("ads")}
          className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "ads" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Add Ad Spend
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "credentials" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          API Credentials
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "logs" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Sync Logs
        </button>
      </div>

      {/* CSV Import */}
      {activeTab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>Import CSV Data</CardTitle>
            <CardDescription>Bulk import sales or ad spend data from SellerCloud exports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Data Type</Label>
                <select
                  value={csvType}
                  onChange={(e) => setCsvType(e.target.value as "sales" | "ads")}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="sales">Sales Data</option>
                  <option value="ads">Ad Spend Data</option>
                </select>
              </div>

              <div>
                <Label>CSV File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-900/50 transition">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm font-medium">{csvFile ? csvFile.name : "Click to upload CSV file"}</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </label>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded p-4">
                <p className="text-sm font-medium mb-2">CSV Format for Sales Data:</p>
                <code className="text-xs text-gray-400">
                  order_id, marketplace, product_sku, product_name, quantity, unit_price, revenue, cogs, order_date
                </code>
                <p className="text-sm font-medium mt-4 mb-2">CSV Format for Ad Spend Data:</p>
                <code className="text-xs text-gray-400">
                  marketplace, ad_spend, impressions, clicks, conversions, revenue_from_ads, date
                </code>
              </div>

              <Button onClick={handleCSVUpload} disabled={!csvFile || isUploading} className="w-full">
                {isUploading ? "Importing..." : "Import CSV"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Sync Logs */}
      {activeTab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle>Data Sync Logs</CardTitle>
            <CardDescription>Monitor all data import and sync operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Source</th>
                    <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold">Records</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-900/50">
                    <td className="py-3 px-4">CSV Import</td>
                    <td className="py-3 px-4">products.csv</td>
                    <td className="py-3 px-4 text-xs text-gray-500">2026-03-26 10:30:00</td>
                    <td className="py-3 px-4 font-semibold">1,250</td>
                    <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-900/30 text-green-400">Success</span></td>
                    <td className="py-3 px-4 text-xs">Successfully imported 1,250 products</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-900/50">
                    <td className="py-3 px-4">API Sync</td>
                    <td className="py-3 px-4">Amazon API</td>
                    <td className="py-3 px-4 text-xs text-gray-500">2026-03-26 09:15:00</td>
                    <td className="py-3 px-4 font-semibold">3,420</td>
                    <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-900/30 text-green-400">Success</span></td>
                    <td className="py-3 px-4 text-xs">Synced 3,420 orders from Amazon</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-900/50">
                    <td className="py-3 px-4">Manual Entry</td>
                    <td className="py-3 px-4">User Input</td>
                    <td className="py-3 px-4 text-xs text-gray-500">2026-03-26 08:45:00</td>
                    <td className="py-3 px-4 font-semibold">42</td>
                    <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-green-900/30 text-green-400">Success</span></td>
                    <td className="py-3 px-4 text-xs">Added 42 new customers</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-900/50">
                    <td className="py-3 px-4">CSV Import</td>
                    <td className="py-3 px-4">inventory.csv</td>
                    <td className="py-3 px-4 text-xs text-gray-500">2026-03-26 07:20:00</td>
                    <td className="py-3 px-4 font-semibold">0</td>
                    <td className="py-3 px-4"><span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-900/30 text-red-400">Error</span></td>
                    <td className="py-3 px-4 text-xs">Failed: Invalid column format in row 156</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
