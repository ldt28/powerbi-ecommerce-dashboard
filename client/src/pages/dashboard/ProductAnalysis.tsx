import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

export default function ProductAnalysis() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const { data: salesData, isLoading } = trpc.dashboard.getSalesData.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  if (isLoading) {
    return <div className="p-8">Loading product data...</div>;
  }

  // Group by product SKU
  const byProduct: Record<string, { name: string; revenue: number; quantity: number; profit: number; margin: number }> = {};
  salesData?.forEach((item) => {
    const sku = item.productSku || "Unknown";
    if (!byProduct[sku]) {
      byProduct[sku] = { name: item.productName || sku, revenue: 0, quantity: 0, profit: 0, margin: 0 };
    }
    byProduct[sku].revenue += parseFloat(item.revenue as any);
    byProduct[sku].quantity += item.quantity;
    byProduct[sku].profit += parseFloat(item.profit as any);
  });

  Object.keys(byProduct).forEach((key) => {
    byProduct[key].margin = byProduct[key].revenue > 0 ? (byProduct[key].profit / byProduct[key].revenue) * 100 : 0;
  });

  const productData = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((p) => ({
      ...p,
      margin: parseFloat(p.margin.toFixed(2)),
    }));

  const totalRevenue = salesData?.reduce((sum, item) => sum + parseFloat(item.revenue as any), 0) || 0;
  const totalProfit = salesData?.reduce((sum, item) => sum + parseFloat(item.profit as any), 0) || 0;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Product Analysis</h1>
        <p className="text-gray-500 mt-2">Track your top-performing products and profit margins</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalProfit.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">Gross profit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin.toFixed(2)}%</div>
            <p className="text-xs text-gray-500 mt-1">Profit margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productData.length}</div>
            <p className="text-xs text-gray-500 mt-1">Tracked SKUs</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Products by Revenue</CardTitle>
          <CardDescription>Revenue and profit margin</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              <Bar yAxisId="right" dataKey="margin" fill="#10b981" name="Margin (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Detailed metrics for each product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4">Product</th>
                  <th className="text-right py-2 px-4">Revenue</th>
                  <th className="text-right py-2 px-4">Quantity</th>
                  <th className="text-right py-2 px-4">Profit</th>
                  <th className="text-right py-2 px-4">Margin</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{product.name}</td>
                    <td className="text-right py-2 px-4">${product.revenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td className="text-right py-2 px-4">{product.quantity}</td>
                    <td className="text-right py-2 px-4">${product.profit.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
                    <td className="text-right py-2 px-4 font-semibold">{product.margin.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
