import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useState } from "react";
import { TrendingUp, Package, DollarSign, ShoppingCart } from "lucide-react";
import { DateRangeFilter, type DateRange } from "@/components/DateRangeFilter";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function RevenueOverview() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const { data: salesData, isLoading } = trpc.dashboard.getSalesData.useQuery({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading revenue data...</div>;
  }

  // Calculate summary metrics
  const totalRevenue = salesData?.reduce((sum, item) => sum + parseFloat(item.revenue as any), 0) || 0;
  const totalProfit = salesData?.reduce((sum, item) => sum + parseFloat(item.profit as any), 0) || 0;
  const totalOrders = salesData?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Group by marketplace
  const byMarketplace: Record<string, { revenue: number; orders: number; profit: number; cogs: number }> = {};
  salesData?.forEach((item) => {
    if (!byMarketplace[item.marketplace]) {
      byMarketplace[item.marketplace] = { revenue: 0, orders: 0, profit: 0, cogs: 0 };
    }
    byMarketplace[item.marketplace].revenue += parseFloat(item.revenue as any);
    byMarketplace[item.marketplace].orders += 1;
    byMarketplace[item.marketplace].profit += parseFloat(item.profit as any);
    byMarketplace[item.marketplace].cogs += parseFloat(item.cogs as any) || 0;
  });

  const marketplaceData = Object.entries(byMarketplace).map(([name, data]) => ({
    name,
    revenue: data.revenue,
    orders: data.orders,
    profit: data.profit,
    cogs: data.cogs,
  }));

  // Group by date for trend
  const byDate: Record<string, { revenue: number; profit: number; orders: number }> = {};
  salesData?.forEach((item) => {
    const date = format(new Date(item.orderDate), "MMM dd");
    if (!byDate[date]) {
      byDate[date] = { revenue: 0, profit: 0, orders: 0 };
    }
    byDate[date].revenue += parseFloat(item.revenue as any);
    byDate[date].profit += parseFloat(item.profit as any);
    byDate[date].orders += 1;
  });

  const trendData = Object.entries(byDate).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    profit: data.profit,
    orders: data.orders,
  }));

  // Top products
  const productStats: Record<string, { revenue: number; units: number; profit: number }> = {};
  salesData?.forEach((item) => {
    const productName = item.productName || "Unknown";
    if (!productStats[productName]) {
      productStats[productName] = { revenue: 0, units: 0, profit: 0 };
    }
    productStats[productName].revenue += parseFloat(item.revenue as any);
    productStats[productName].units += 1;
    productStats[productName].profit += parseFloat(item.profit as any);
  });

  const topProducts = Object.entries(productStats)
    .map(([name, data]) => ({
      name: name || "Unknown",
      revenue: data.revenue,
      units: data.units,
      profit: data.profit,
      margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revenue Overview</h1>
          <p className="text-muted-foreground mt-2">Track your sales across all marketplaces</p>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="month" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-green-600 mt-1">{profitMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all channels</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <Package className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${avgOrderValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Marketplace */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Revenue by Marketplace</CardTitle>
            <CardDescription>Distribution across channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={marketplaceData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {marketplaceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marketplace Performance */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Marketplace Performance</CardTitle>
            <CardDescription>Revenue and orders by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketplaceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }} />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      {topProducts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Top Products by Revenue</CardTitle>
            <CardDescription>Your best-performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Product</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Units</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Profit</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                      <td className="text-right py-3 px-4 text-foreground font-semibold">${product.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="text-right py-3 px-4 text-foreground">{product.units}</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">${product.profit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="text-right py-3 px-4 text-green-500 font-semibold">{product.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
