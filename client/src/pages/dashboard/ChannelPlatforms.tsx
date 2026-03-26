import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ExportButtons } from "@/components/ExportButtons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, DollarSign, Users, Star } from "lucide-react";

/**
 * Channel Platforms Dashboard
 * Tracks performance metrics for individual retail platforms
 */

// Platform data structure
const platformsData = {
  amazon: {
    name: "Amazon",
    icon: "🛒",
    metrics: {
      revenue: 125000,
      orders: 2450,
      aov: 51.02,
      rating: 4.8,
      reviews: 1240,
      conversionRate: 3.2,
      returnRate: 2.1,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 95000, orders: 1850 },
      { month: "Feb", revenue: 108000, orders: 2100 },
      { month: "Mar", revenue: 125000, orders: 2450 },
    ],
    topProducts: [
      { name: "Product A", sales: 45000, units: 890 },
      { name: "Product B", sales: 38000, units: 720 },
      { name: "Product C", sales: 25000, units: 480 },
      { name: "Product D", sales: 17000, units: 320 },
    ],
  },
  ebay: {
    name: "eBay",
    icon: "📱",
    metrics: {
      revenue: 87000,
      orders: 1680,
      aov: 51.79,
      rating: 4.7,
      reviews: 890,
      conversionRate: 2.8,
      returnRate: 2.5,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 72000, orders: 1380 },
      { month: "Feb", revenue: 78000, orders: 1510 },
      { month: "Mar", revenue: 87000, orders: 1680 },
    ],
    topProducts: [
      { name: "Product X", sales: 32000, units: 610 },
      { name: "Product Y", sales: 28000, units: 540 },
      { name: "Product Z", sales: 18000, units: 350 },
      { name: "Product W", sales: 9000, units: 180 },
    ],
  },
  walmart: {
    name: "Walmart",
    icon: "🏪",
    metrics: {
      revenue: 156000,
      orders: 3120,
      aov: 49.98,
      rating: 4.6,
      reviews: 1560,
      conversionRate: 3.5,
      returnRate: 1.8,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 128000, orders: 2560 },
      { month: "Feb", revenue: 142000, orders: 2840 },
      { month: "Mar", revenue: 156000, orders: 3120 },
    ],
    topProducts: [
      { name: "Product M", sales: 58000, units: 1160 },
      { name: "Product N", sales: 48000, units: 960 },
      { name: "Product O", sales: 32000, units: 640 },
      { name: "Product P", sales: 18000, units: 360 },
    ],
  },
  webstores: {
    name: "WebStores",
    icon: "🌐",
    metrics: {
      revenue: 95000,
      orders: 1420,
      aov: 66.9,
      rating: 4.9,
      reviews: 710,
      conversionRate: 4.2,
      returnRate: 1.2,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 78000, orders: 1160 },
      { month: "Feb", revenue: 86000, orders: 1290 },
      { month: "Mar", revenue: 95000, orders: 1420 },
    ],
    topProducts: [
      { name: "Product 1", sales: 42000, units: 630 },
      { name: "Product 2", sales: 28000, units: 420 },
      { name: "Product 3", sales: 18000, units: 270 },
      { name: "Product 4", sales: 7000, units: 100 },
    ],
  },
  tractorSupply: {
    name: "Tractor Supply",
    icon: "🚜",
    metrics: {
      revenue: 68000,
      orders: 980,
      aov: 69.39,
      rating: 4.5,
      reviews: 490,
      conversionRate: 2.9,
      returnRate: 2.3,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 52000, orders: 750 },
      { month: "Feb", revenue: 60000, orders: 870 },
      { month: "Mar", revenue: 68000, orders: 980 },
    ],
    topProducts: [
      { name: "Product TS1", sales: 28000, units: 400 },
      { name: "Product TS2", sales: 18000, units: 260 },
      { name: "Product TS3", sales: 14000, units: 200 },
      { name: "Product TS4", sales: 8000, units: 120 },
    ],
  },
  autozone: {
    name: "AutoZone",
    icon: "🚗",
    metrics: {
      revenue: 112000,
      orders: 1840,
      aov: 60.87,
      rating: 4.7,
      reviews: 920,
      conversionRate: 3.1,
      returnRate: 2.0,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 92000, orders: 1510 },
      { month: "Feb", revenue: 102000, orders: 1680 },
      { month: "Mar", revenue: 112000, orders: 1840 },
    ],
    topProducts: [
      { name: "Product AZ1", sales: 48000, units: 790 },
      { name: "Product AZ2", sales: 35000, units: 575 },
      { name: "Product AZ3", sales: 20000, units: 330 },
      { name: "Product AZ4", sales: 9000, units: 145 },
    ],
  },
  northernTool: {
    name: "Northern Tool",
    icon: "🔧",
    metrics: {
      revenue: 76000,
      orders: 1020,
      aov: 74.51,
      rating: 4.8,
      reviews: 510,
      conversionRate: 3.3,
      returnRate: 1.5,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 62000, orders: 830 },
      { month: "Feb", revenue: 69000, orders: 930 },
      { month: "Mar", revenue: 76000, orders: 1020 },
    ],
    topProducts: [
      { name: "Product NT1", sales: 32000, units: 430 },
      { name: "Product NT2", sales: 22000, units: 295 },
      { name: "Product NT3", sales: 15000, units: 200 },
      { name: "Product NT4", sales: 7000, units: 95 },
    ],
  },
  lowes: {
    name: "Lowe's",
    icon: "🏗️",
    metrics: {
      revenue: 134000,
      orders: 2680,
      aov: 49.96,
      rating: 4.6,
      reviews: 1340,
      conversionRate: 3.4,
      returnRate: 2.2,
    },
    monthlyRevenue: [
      { month: "Jan", revenue: 108000, orders: 2160 },
      { month: "Feb", revenue: 121000, orders: 2420 },
      { month: "Mar", revenue: 134000, orders: 2680 },
    ],
    topProducts: [
      { name: "Product LW1", sales: 52000, units: 1040 },
      { name: "Product LW2", sales: 40000, units: 800 },
      { name: "Product LW3", sales: 28000, units: 560 },
      { name: "Product LW4", sales: 14000, units: 280 },
    ],
  },
};

const PlatformTab = ({ platform, data }: { platform: string; data: (typeof platformsData)[keyof typeof platformsData] }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(data.metrics.revenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+{Math.round(Math.random() * 30 + 10)}% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.orders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
            <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+{Math.round(Math.random() * 25 + 8)}% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.metrics.aov.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average per order</p>
            <div className="flex items-center gap-1 mt-2 text-purple-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+{(Math.random() * 5 + 1).toFixed(1)}% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.rating}/5</div>
            <p className="text-xs text-muted-foreground">{data.metrics.reviews} reviews</p>
            <div className="flex items-center gap-1 mt-2 text-yellow-600 text-sm">
              <Star className="h-3 w-3" />
              <span>Highly rated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by sales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key performance indicators for {data.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
              <p className="text-xl font-semibold">{data.metrics.conversionRate}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Return Rate</p>
              <p className="text-xl font-semibold">{data.metrics.returnRate}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Reviews</p>
              <p className="text-xl font-semibold">{data.metrics.reviews.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Platform Rating</p>
              <p className="text-xl font-semibold">{data.metrics.rating}⭐</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function ChannelPlatforms() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 90)),
    endDate: new Date(),
  });

  const handleDateRangeChange = (newRange: any) => {
    setDateRange(newRange);
  };

  const totalRevenue = Object.values(platformsData).reduce((sum, p) => sum + p.metrics.revenue, 0);
  const totalOrders = Object.values(platformsData).reduce((sum, p) => sum + p.metrics.orders, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Retail Platforms</h1>
          <p className="text-muted-foreground mt-2">
            Track performance metrics across all retail channels
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <ExportButtons
            title="Retail Platforms Report"
            dateRange={{ from: dateRange.startDate, to: dateRange.endDate }}
            data={{
              kpis: {
                "Total Revenue": `$${(totalRevenue / 1000).toFixed(1)}K`,
                "Total Orders": totalOrders,
                "Avg Revenue per Platform": `$${(totalRevenue / 8 / 1000).toFixed(1)}K`,
              },
              tables: [
                {
                  title: "Platform Performance",
                  data: Object.entries(platformsData).map(([key, data]) => ({
                    Platform: data.name,
                    Revenue: `$${data.metrics.revenue}`,
                    Orders: data.metrics.orders,
                    AOV: `$${data.metrics.aov.toFixed(2)}`,
                    Rating: `${data.metrics.rating}/5`,
                  })),
                },
              ],
            }}
          />
          <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="month" />
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {Object.entries(platformsData).map(([key, platform]) => (
          <Card key={key} className="p-3">
            <div className="text-2xl mb-2">{platform.icon}</div>
            <p className="text-xs font-semibold truncate">{platform.name}</p>
            <p className="text-sm font-bold text-green-600">${(platform.metrics.revenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">{platform.metrics.orders} orders</p>
          </Card>
        ))}
      </div>

      {/* Tabbed Platform Details */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Details</CardTitle>
          <CardDescription>Select a platform to view detailed metrics and performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="amazon" className="w-full">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
              <TabsTrigger value="amazon">Amazon</TabsTrigger>
              <TabsTrigger value="ebay">eBay</TabsTrigger>
              <TabsTrigger value="walmart">Walmart</TabsTrigger>
              <TabsTrigger value="webstores">WebStores</TabsTrigger>
              <TabsTrigger value="tractorSupply">Tractor</TabsTrigger>
              <TabsTrigger value="autozone">AutoZone</TabsTrigger>
              <TabsTrigger value="northernTool">Northern</TabsTrigger>
              <TabsTrigger value="lowes">Lowe's</TabsTrigger>
            </TabsList>

            <TabsContent value="amazon" className="mt-6">
              <PlatformTab platform="amazon" data={platformsData.amazon} />
            </TabsContent>

            <TabsContent value="ebay" className="mt-6">
              <PlatformTab platform="ebay" data={platformsData.ebay} />
            </TabsContent>

            <TabsContent value="walmart" className="mt-6">
              <PlatformTab platform="walmart" data={platformsData.walmart} />
            </TabsContent>

            <TabsContent value="webstores" className="mt-6">
              <PlatformTab platform="webstores" data={platformsData.webstores} />
            </TabsContent>

            <TabsContent value="tractorSupply" className="mt-6">
              <PlatformTab platform="tractorSupply" data={platformsData.tractorSupply} />
            </TabsContent>

            <TabsContent value="autozone" className="mt-6">
              <PlatformTab platform="autozone" data={platformsData.autozone} />
            </TabsContent>

            <TabsContent value="northernTool" className="mt-6">
              <PlatformTab platform="northernTool" data={platformsData.northernTool} />
            </TabsContent>

            <TabsContent value="lowes" className="mt-6">
              <PlatformTab platform="lowes" data={platformsData.lowes} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Comparison</CardTitle>
          <CardDescription>Side-by-side comparison of all retail platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Platform</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold">AOV</th>
                  <th className="text-right py-3 px-4 font-semibold">Rating</th>
                  <th className="text-right py-3 px-4 font-semibold">Conv. Rate</th>
                  <th className="text-right py-3 px-4 font-semibold">Return Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(platformsData).map(([key, platform]) => (
                  <tr key={key} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{platform.name}</td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">
                      ${platform.metrics.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">{platform.metrics.orders.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">${platform.metrics.aov.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{platform.metrics.rating}⭐</td>
                    <td className="text-right py-3 px-4">{platform.metrics.conversionRate}%</td>
                    <td className="text-right py-3 px-4">{platform.metrics.returnRate}%</td>
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
