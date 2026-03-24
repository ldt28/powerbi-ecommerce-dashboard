import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function CustomerDashboard() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  const { data: salesData, isLoading } = trpc.dashboard.getSalesData.useQuery({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  if (isLoading) {
    return <div className="p-8">Loading customer data...</div>;
  }

  // Calculate customer metrics
  const customerMetrics: Record<string, {
    customerId: string;
    orders: number;
    totalSpent: number;
    firstOrder: Date;
    lastOrder: Date;
    marketplace: string;
  }> = {};

  salesData?.forEach((item) => {
    const customerId = item.orderId || `customer-${Math.random()}`;
    if (!customerMetrics[customerId]) {
      customerMetrics[customerId] = {
        customerId,
        orders: 0,
        totalSpent: 0,
        firstOrder: new Date(item.orderDate),
        lastOrder: new Date(item.orderDate),
        marketplace: item.marketplace || "Unknown",
      };
    }
    customerMetrics[customerId].orders += 1;
    customerMetrics[customerId].totalSpent += parseFloat(item.revenue);
    customerMetrics[customerId].lastOrder = new Date(item.orderDate) > customerMetrics[customerId].lastOrder ? new Date(item.orderDate) : customerMetrics[customerId].lastOrder;
  });

  // Calculate LTV and repeat purchase rate
  const customers = Object.values(customerMetrics);
  const totalCustomers = customers.length;
  const repeatCustomers = customers.filter((c) => c.orders > 1).length;
  const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  const avgLTV = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers : 0;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  // New customers (first order in date range)
  const newCustomers = customers.filter((c) => {
    const daysSinceFirstOrder = (new Date().getTime() - new Date(c.firstOrder).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceFirstOrder <= 90;
  }).length;

  // Customer segments by order count
  const segments = {
    oneTime: customers.filter((c) => c.orders === 1).length,
    twoToFive: customers.filter((c) => c.orders >= 2 && c.orders <= 5).length,
    sixToTen: customers.filter((c) => c.orders >= 6 && c.orders <= 10).length,
    tenPlus: customers.filter((c) => c.orders > 10).length,
  };

  const segmentData = [
    { name: "1 Order", value: segments.oneTime, fill: "#ef4444" },
    { name: "2-5 Orders", value: segments.twoToFive, fill: "#f59e0b" },
    { name: "6-10 Orders", value: segments.sixToTen, fill: "#3b82f6" },
    { name: "10+ Orders", value: segments.tenPlus, fill: "#10b981" },
  ];

  // Customer value distribution
  const ltv_ranges = {
    "0-50": customers.filter((c) => c.totalSpent < 50).length,
    "50-100": customers.filter((c) => c.totalSpent >= 50 && c.totalSpent < 100).length,
    "100-250": customers.filter((c) => c.totalSpent >= 100 && c.totalSpent < 250).length,
    "250-500": customers.filter((c) => c.totalSpent >= 250 && c.totalSpent < 500).length,
    "500+": customers.filter((c) => c.totalSpent >= 500).length,
  };

  const ltvDistribution = [
    { range: "$0-50", count: ltv_ranges["0-50"] },
    { range: "$50-100", count: ltv_ranges["50-100"] },
    { range: "$100-250", count: ltv_ranges["100-250"] },
    { range: "$250-500", count: ltv_ranges["250-500"] },
    { range: "$500+", count: ltv_ranges["500+"] },
  ];

  // Marketplace customer distribution
  const byMarketplace: Record<string, number> = {};
  customers.forEach((c) => {
    byMarketplace[c.marketplace] = (byMarketplace[c.marketplace] || 0) + 1;
  });

  const marketplaceData = Object.entries(byMarketplace).map(([name, count]) => ({
    name,
    customers: count,
  }));

  // Top customers
  const topCustomers = customers
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map((c, idx) => ({
      rank: idx + 1,
      id: c.customerId.substring(0, 15),
      spent: parseFloat(c.totalSpent.toFixed(2)),
      orders: c.orders,
      marketplace: c.marketplace,
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Customer Analytics</h1>
        <p className="text-gray-500 mt-2">Track customer lifetime value, retention, and segments</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Unique customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCustomers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Last 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgLTV.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Repeat Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatPurchaseRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Returning customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution by order frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LTV Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Value Distribution</CardTitle>
            <CardDescription>Customers by lifetime value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ltvDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customers by Marketplace */}
        <Card>
          <CardHeader>
            <CardTitle>Customers by Marketplace</CardTitle>
            <CardDescription>Distribution across channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marketplaceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Customers</CardTitle>
            <CardDescription>By lifetime value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium">#{customer.rank} - {customer.id}</div>
                    <div className="text-xs text-gray-500">{customer.orders} orders • {customer.marketplace}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">${customer.spent.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Summary</CardTitle>
          <CardDescription>Key metrics overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-900/50 rounded">
              <div className="text-xs text-gray-500 mb-1">One-Time Buyers</div>
              <div className="text-xl font-bold">{segments.oneTime}</div>
              <div className="text-xs text-gray-600 mt-1">{((segments.oneTime / totalCustomers) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded">
              <div className="text-xs text-gray-500 mb-1">Repeat (2-5x)</div>
              <div className="text-xl font-bold">{segments.twoToFive}</div>
              <div className="text-xs text-gray-600 mt-1">{((segments.twoToFive / totalCustomers) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded">
              <div className="text-xs text-gray-500 mb-1">Loyal (6-10x)</div>
              <div className="text-xl font-bold">{segments.sixToTen}</div>
              <div className="text-xs text-gray-600 mt-1">{((segments.sixToTen / totalCustomers) * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-gray-900/50 rounded">
              <div className="text-xs text-gray-500 mb-1">VIP (10+x)</div>
              <div className="text-xl font-bold">{segments.tenPlus}</div>
              <div className="text-xs text-gray-600 mt-1">{((segments.tenPlus / totalCustomers) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
