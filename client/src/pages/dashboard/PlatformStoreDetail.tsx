import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";
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

// Mock data for each store
const storeData: Record<string, any> = {
  amazon: {
    name: "Amazon",
    totalRevenue: 156000,
    orders: 3120,
    aov: 49.96,
    conversionRate: 3.2,
    rating: 4.8,
    returnRate: 1.8,
    monthlyTrend: [
      { month: "Jan", revenue: 12000, orders: 240 },
      { month: "Feb", revenue: 13500, orders: 270 },
      { month: "Mar", revenue: 15000, orders: 300 },
      { month: "Apr", revenue: 16200, orders: 324 },
      { month: "May", revenue: 17500, orders: 350 },
      { month: "Jun", revenue: 18000, orders: 360 },
    ],
    topProducts: [
      { name: "Premium Drill Set", revenue: 24000, orders: 480 },
      { name: "Power Saw Kit", revenue: 22000, orders: 440 },
      { name: "Tool Organizer", revenue: 18000, orders: 360 },
      { name: "Screwdriver Set", revenue: 15000, orders: 300 },
    ],
    categoryBreakdown: [
      { name: "Power Tools", value: 45 },
      { name: "Hand Tools", value: 30 },
      { name: "Safety Gear", value: 15 },
      { name: "Accessories", value: 10 },
    ],
  },
  ebay: {
    name: "eBay",
    totalRevenue: 98000,
    orders: 2450,
    aov: 40.0,
    conversionRate: 2.8,
    rating: 4.6,
    returnRate: 2.5,
    monthlyTrend: [
      { month: "Jan", revenue: 15000, orders: 375 },
      { month: "Feb", revenue: 15500, orders: 387 },
      { month: "Mar", revenue: 16000, orders: 400 },
      { month: "Apr", revenue: 16500, orders: 412 },
      { month: "May", revenue: 17000, orders: 425 },
      { month: "Jun", revenue: 18000, orders: 451 },
    ],
    topProducts: [
      { name: "Vintage Tool Set", revenue: 18000, orders: 450 },
      { name: "Refurbished Drill", revenue: 16000, orders: 400 },
      { name: "Used Saw", revenue: 14000, orders: 350 },
      { name: "Tool Bundle", revenue: 12000, orders: 300 },
    ],
    categoryBreakdown: [
      { name: "Used Tools", value: 50 },
      { name: "Vintage Items", value: 30 },
      { name: "New Tools", value: 15 },
      { name: "Parts", value: 5 },
    ],
  },
  walmart: {
    name: "Walmart",
    totalRevenue: 156000,
    orders: 3120,
    aov: 49.96,
    conversionRate: 3.5,
    rating: 4.7,
    returnRate: 1.9,
    monthlyTrend: [
      { month: "Jan", revenue: 24000, orders: 480 },
      { month: "Feb", revenue: 25000, orders: 500 },
      { month: "Mar", revenue: 26000, orders: 520 },
      { month: "Apr", revenue: 26500, orders: 530 },
      { month: "May", revenue: 27000, orders: 540 },
      { month: "Jun", revenue: 28000, orders: 560 },
    ],
    topProducts: [
      { name: "Basic Tool Kit", revenue: 32000, orders: 640 },
      { name: "Hammer Set", revenue: 28000, orders: 560 },
      { name: "Wrench Collection", revenue: 24000, orders: 480 },
      { name: "Screwdriver Pack", revenue: 20000, orders: 400 },
    ],
    categoryBreakdown: [
      { name: "Hand Tools", value: 40 },
      { name: "Power Tools", value: 35 },
      { name: "Safety Equipment", value: 15 },
      { name: "Accessories", value: 10 },
    ],
  },
  webstores: {
    name: "WebStores",
    totalRevenue: 112000,
    orders: 2800,
    aov: 40.0,
    conversionRate: 4.2,
    rating: 4.9,
    returnRate: 1.2,
    monthlyTrend: [
      { month: "Jan", revenue: 16000, orders: 400 },
      { month: "Feb", revenue: 17000, orders: 425 },
      { month: "Mar", revenue: 18000, orders: 450 },
      { month: "Apr", revenue: 18500, orders: 462 },
      { month: "May", revenue: 19000, orders: 475 },
      { month: "Jun", revenue: 24000, orders: 600 },
    ],
    topProducts: [
      { name: "Premium Drill", revenue: 22000, orders: 550 },
      { name: "Advanced Saw", revenue: 20000, orders: 500 },
      { name: "Professional Kit", revenue: 18000, orders: 450 },
      { name: "Safety Bundle", revenue: 16000, orders: 400 },
    ],
    categoryBreakdown: [
      { name: "Professional Tools", value: 50 },
      { name: "Power Tools", value: 30 },
      { name: "Safety Gear", value: 15 },
      { name: "Accessories", value: 5 },
    ],
  },
  tractorSupply: {
    name: "Tractor Supply",
    totalRevenue: 68000,
    orders: 1700,
    aov: 40.0,
    conversionRate: 2.5,
    rating: 4.5,
    returnRate: 2.1,
    monthlyTrend: [
      { month: "Jan", revenue: 10000, orders: 250 },
      { month: "Feb", revenue: 10500, orders: 262 },
      { month: "Mar", revenue: 11000, orders: 275 },
      { month: "Apr", revenue: 11500, orders: 287 },
      { month: "May", revenue: 12000, orders: 300 },
      { month: "Jun", revenue: 13000, orders: 325 },
    ],
    topProducts: [
      { name: "Farm Tools", revenue: 14000, orders: 350 },
      { name: "Tractor Parts", revenue: 12000, orders: 300 },
      { name: "Equipment", revenue: 10000, orders: 250 },
      { name: "Supplies", revenue: 8000, orders: 200 },
    ],
    categoryBreakdown: [
      { name: "Farm Equipment", value: 45 },
      { name: "Tractor Parts", value: 35 },
      { name: "Tools", value: 15 },
      { name: "Supplies", value: 5 },
    ],
  },
  autozone: {
    name: "AutoZone",
    totalRevenue: 85000,
    orders: 2125,
    aov: 40.0,
    conversionRate: 2.9,
    rating: 4.6,
    returnRate: 1.7,
    monthlyTrend: [
      { month: "Jan", revenue: 12000, orders: 300 },
      { month: "Feb", revenue: 13000, orders: 325 },
      { month: "Mar", revenue: 14000, orders: 350 },
      { month: "Apr", revenue: 14500, orders: 362 },
      { month: "May", revenue: 15000, orders: 375 },
      { month: "Jun", revenue: 16500, orders: 412 },
    ],
    topProducts: [
      { name: "Auto Tools", revenue: 18000, orders: 450 },
      { name: "Diagnostic Kit", revenue: 16000, orders: 400 },
      { name: "Socket Set", revenue: 14000, orders: 350 },
      { name: "Wrench Set", revenue: 12000, orders: 300 },
    ],
    categoryBreakdown: [
      { name: "Auto Tools", value: 40 },
      { name: "Diagnostic Equipment", value: 30 },
      { name: "Socket Sets", value: 20 },
      { name: "Accessories", value: 10 },
    ],
  },
  northernTool: {
    name: "Northern Tool",
    totalRevenue: 149000,
    orders: 2000,
    aov: 74.51,
    conversionRate: 3.1,
    rating: 4.8,
    returnRate: 1.5,
    monthlyTrend: [
      { month: "Jan", revenue: 22000, orders: 295 },
      { month: "Feb", revenue: 23000, orders: 308 },
      { month: "Mar", revenue: 24000, orders: 321 },
      { month: "Apr", revenue: 25000, orders: 335 },
      { month: "May", revenue: 26000, orders: 348 },
      { month: "Jun", revenue: 29000, orders: 389 },
    ],
    topProducts: [
      { name: "Industrial Drill", revenue: 35000, orders: 469 },
      { name: "Heavy Duty Saw", revenue: 32000, orders: 429 },
      { name: "Professional Kit", revenue: 28000, orders: 375 },
      { name: "Power Tools Bundle", revenue: 24000, orders: 321 },
    ],
    categoryBreakdown: [
      { name: "Industrial Tools", value: 50 },
      { name: "Power Tools", value: 30 },
      { name: "Equipment", value: 15 },
      { name: "Accessories", value: 5 },
    ],
  },
  lowes: {
    name: "Lowe's",
    totalRevenue: 142000,
    orders: 2840,
    aov: 49.96,
    conversionRate: 3.3,
    rating: 4.7,
    returnRate: 1.9,
    monthlyTrend: [
      { month: "Jan", revenue: 20000, orders: 400 },
      { month: "Feb", revenue: 21000, orders: 420 },
      { month: "Mar", revenue: 22000, orders: 440 },
      { month: "Apr", revenue: 23000, orders: 460 },
      { month: "May", revenue: 24000, orders: 480 },
      { month: "Jun", revenue: 32000, orders: 640 },
    ],
    topProducts: [
      { name: "Home Improvement Kit", revenue: 28000, orders: 560 },
      { name: "Power Drill", revenue: 26000, orders: 520 },
      { name: "Tool Set", revenue: 24000, orders: 480 },
      { name: "Safety Equipment", revenue: 20000, orders: 400 },
    ],
    categoryBreakdown: [
      { name: "Home Improvement", value: 40 },
      { name: "Power Tools", value: 35 },
      { name: "Hand Tools", value: 15 },
      { name: "Safety Gear", value: 10 },
    ],
  },
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PlatformStoreDetail() {
  const [match, params] = useRoute("/dashboard/store/:storeName");

  if (!match) return null;

  const storeName = (params?.storeName as string)?.toLowerCase();
  const store = storeData[storeName];

  if (!store) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard/channels">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Channels
            </Button>
          </Link>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
            <p className="text-muted-foreground">The store "{storeName}" could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/channels">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Channels
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{store.name} Performance</h1>
          <p className="text-muted-foreground">Detailed analytics and metrics for {store.name}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(store.totalRevenue / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{store.orders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Avg Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${store.aov.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Average per order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{store.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Platform average</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue & Orders Trend</CardTitle>
              <CardDescription>Last 6 months performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={store.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Category distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={store.categoryBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {store.categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products on {store.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={store.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                <Bar dataKey="orders" fill="#10b981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Platform Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{store.rating.toFixed(1)} ⭐</div>
              <p className="text-xs text-muted-foreground mt-1">Customer satisfaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{store.returnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Product returns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{(store.rating * 20).toFixed(0)}/100</div>
              <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
