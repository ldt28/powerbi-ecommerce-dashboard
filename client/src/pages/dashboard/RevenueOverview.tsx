import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function RevenueOverview() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const { data: salesData, isLoading } = trpc.dashboard.getSalesData.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  if (isLoading) {
    return <div className="p-8">Loading revenue data...</div>;
  }

  // Calculate summary metrics
  const totalRevenue = salesData?.reduce((sum, item) => sum + parseFloat(item.revenue as any), 0) || 0;
  const totalOrders = salesData?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group by marketplace
  const byMarketplace: Record<string, { revenue: number; orders: number; profit: number }> = {};
  salesData?.forEach((item) => {
    if (!byMarketplace[item.marketplace]) {
      byMarketplace[item.marketplace] = { revenue: 0, orders: 0, profit: 0 };
    }
    byMarketplace[item.marketplace].revenue += parseFloat(item.revenue as any);
    byMarketplace[item.marketplace].orders += 1;
    byMarketplace[item.marketplace].profit += parseFloat(item.profit as any);
  });

  const marketplaceData = Object.entries(byMarketplace).map(([name, data]) => ({
    name,
    revenue: data.revenue,
    orders: data.orders,
    profit: data.profit,
  }));

  // Group by date for trend
  const byDate: Record<string, number> = {};
  salesData?.forEach((item) => {
    const date = format(new Date(item.orderDate), "MMM dd");
    byDate[date] = (byDate[date] || 0) + parseFloat(item.revenue as any);
  });

  const trendData = Object.entries(byDate).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Revenue Overview</h1>
        <p className="text-gray-500 mt-2">Track your sales across all marketplaces</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">Last 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Across all channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">Per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Marketplace */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Marketplace</CardTitle>
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

        {/* Orders by Marketplace */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Marketplace Performance</CardTitle>
            <CardDescription>Orders and revenue by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketplaceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" fill="#3b82f6" name="Orders" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
