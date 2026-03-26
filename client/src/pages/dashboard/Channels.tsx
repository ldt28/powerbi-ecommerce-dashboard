import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ScatterChart,
  Scatter,
} from "recharts";
import { TrendingUp, Users, DollarSign, Target, Activity, ArrowRight } from "lucide-react";
import { ChannelNavigation } from "@/components/ChannelNavigation";
import { getAggregateGAMetrics } from "@/lib/googleAnalytics";

/**
 * Channels Dashboard
 * Tracks marketing channel performance, ROI, customer acquisition, and conversion metrics
 * Includes Google Analytics integration and channel navigation
 */

// Mock data for channel performance
const channelPerformance = [
  {
    channel: "Organic Search",
    spend: 5000,
    revenue: 45000,
    customers: 320,
    conversions: 480,
    roi: 800,
    cac: 15.63,
    conversionRate: 8.5,
  },
  {
    channel: "Paid Search",
    spend: 12000,
    revenue: 72000,
    customers: 420,
    conversions: 840,
    roi: 500,
    cac: 28.57,
    conversionRate: 18.9,
  },
  {
    channel: "Social Media",
    spend: 8000,
    revenue: 32000,
    customers: 280,
    conversions: 320,
    roi: 300,
    cac: 28.57,
    conversionRate: 7.2,
  },
  {
    channel: "Email Marketing",
    spend: 2000,
    revenue: 24000,
    customers: 150,
    conversions: 360,
    roi: 1100,
    cac: 13.33,
    conversionRate: 16.8,
  },
  {
    channel: "Referral",
    spend: 1000,
    revenue: 18000,
    customers: 180,
    conversions: 216,
    roi: 1700,
    cac: 5.56,
    conversionRate: 12.0,
  },
  {
    channel: "Direct",
    spend: 0,
    revenue: 25000,
    customers: 200,
    conversions: 250,
    roi: 0,
    cac: 0,
    conversionRate: 11.1,
  },
];

// Mock data for monthly channel trends
const monthlyChannelTrends = [
  {
    month: "Jan",
    "Organic Search": 38000,
    "Paid Search": 52000,
    "Social Media": 24000,
    "Email Marketing": 18000,
    Referral: 12000,
    Direct: 20000,
  },
  {
    month: "Feb",
    "Organic Search": 42000,
    "Paid Search": 65000,
    "Social Media": 28000,
    "Email Marketing": 22000,
    Referral: 15000,
    Direct: 23000,
  },
  {
    month: "Mar",
    "Organic Search": 45000,
    "Paid Search": 72000,
    "Social Media": 32000,
    "Email Marketing": 24000,
    Referral: 18000,
    Direct: 25000,
  },
];

// Mock data for customer acquisition by channel
const customerAcquisition = [
  {
    channel: "Organic Search",
    newCustomers: 320,
    returningCustomers: 280,
    retention: 87.5,
  },
  {
    channel: "Paid Search",
    newCustomers: 420,
    returningCustomers: 350,
    retention: 83.3,
  },
  {
    channel: "Social Media",
    newCustomers: 280,
    returningCustomers: 200,
    retention: 71.4,
  },
  {
    channel: "Email Marketing",
    newCustomers: 150,
    returningCustomers: 320,
    retention: 68.1,
  },
  {
    channel: "Referral",
    newCustomers: 180,
    returningCustomers: 220,
    retention: 55.0,
  },
  {
    channel: "Direct",
    newCustomers: 200,
    returningCustomers: 450,
    retention: 69.2,
  },
];

// Mock data for channel ROI comparison
const roiComparison = [
  { channel: "Email Marketing", roi: 1100, spend: 2000, revenue: 24000 },
  { channel: "Referral", roi: 1700, spend: 1000, revenue: 18000 },
  { channel: "Organic Search", roi: 800, spend: 5000, revenue: 45000 },
  { channel: "Paid Search", roi: 500, spend: 12000, revenue: 72000 },
  { channel: "Social Media", roi: 300, spend: 8000, revenue: 32000 },
];

// Mock data for channel attribution
const channelAttribution = [
  { name: "Organic Search", value: 28, color: "#3b82f6" },
  { name: "Paid Search", value: 35, color: "#8b5cf6" },
  { name: "Social Media", value: 16, color: "#ec4899" },
  { name: "Email Marketing", value: 12, color: "#f59e0b" },
  { name: "Referral", value: 5, color: "#10b981" },
  { name: "Direct", value: 4, color: "#6b7280" },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6b7280"];

export default function Channels() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 90)),
    endDate: new Date(),
  });

  const handleDateRangeChange = (newRange: any) => {
    setDateRange(newRange);
  };

  // Calculate totals
  const totalSpend = channelPerformance.reduce((sum, ch) => sum + ch.spend, 0);
  const totalRevenue = channelPerformance.reduce((sum, ch) => sum + ch.revenue, 0);
  const totalCustomers = channelPerformance.reduce((sum, ch) => sum + ch.customers, 0);
  const avgROI = (
    channelPerformance.reduce((sum, ch) => sum + ch.roi, 0) / channelPerformance.length
  ).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Channel Navigation */}
      <ChannelNavigation />
      
      {/* Link to Platform Details */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">View Retail Platform Details</h2>
            <p className="text-blue-100">Dive deeper into performance metrics for each retail platform including Amazon, eBay, Walmart, and more.</p>
          </div>
          <a href="/dashboard/channels/platforms" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            View Platforms
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels</h1>
          <p className="text-muted-foreground mt-2">
            Track marketing channel performance, ROI, and customer acquisition metrics
          </p>
        </div>
        <div className="flex gap-3 items-start">
          <ExportButtons
            title="Channels Report"
            dateRange={{ from: dateRange.startDate, to: dateRange.endDate }}
            data={{
              kpis: {
                "Total Spend": `$${(totalSpend / 1000).toFixed(1)}K`,
                "Total Revenue": `$${(totalRevenue / 1000).toFixed(1)}K`,
                "Total Customers": totalCustomers,
                "Avg ROI": `${avgROI}%`,
              },
              tables: [
                {
                  title: "Channel Performance",
                  data: channelPerformance,
                },
              ],
            }}
          />
          <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="month" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalSpend / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Across all channels</p>
            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">From all channels</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+18.3% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Total acquired</p>
            <div className="flex items-center gap-1 mt-2 text-blue-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+22.1% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI}%</div>
            <p className="text-xs text-muted-foreground">Across channels</p>
            <div className="flex items-center gap-1 mt-2 text-purple-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+5.2% vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Google Analytics Metrics */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Google Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const gaMetrics = getAggregateGAMetrics();
            return (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(gaMetrics.totalSessions / 1000).toFixed(1)}K</div>
                    <p className="text-xs text-muted-foreground">Across all channels</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(gaMetrics.totalUsers / 1000).toFixed(1)}K</div>
                    <p className="text-xs text-muted-foreground">Unique visitors</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Bounce Rate</CardTitle>
                    <Target className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gaMetrics.avgBounceRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Lower is better</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GA Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${(gaMetrics.totalRevenue / 1000).toFixed(1)}K</div>
                    <p className="text-xs text-muted-foreground">From GA tracked</p>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>Total revenue generated per channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>ROI by Channel</CardTitle>
            <CardDescription>Return on investment percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Bar dataKey="roi" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trends</CardTitle>
            <CardDescription>Revenue trends across channels over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChannelTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="Organic Search" stroke="#3b82f6" />
                <Line type="monotone" dataKey="Paid Search" stroke="#8b5cf6" />
                <Line type="monotone" dataKey="Social Media" stroke="#ec4899" />
                <Line type="monotone" dataKey="Email Marketing" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Attribution</CardTitle>
            <CardDescription>Percentage of revenue by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelAttribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelAttribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CAC vs Conversion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>CAC vs Conversion Rate</CardTitle>
            <CardDescription>Customer acquisition cost vs conversion efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cac" name="CAC ($)" />
                <YAxis dataKey="conversionRate" name="Conversion Rate (%)" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value: any) => (typeof value === "number" ? value.toFixed(2) : value)}
                />
                <Scatter name="Channels" data={channelPerformance} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Acquisition Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Breakdown</CardTitle>
            <CardDescription>New vs returning customers by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="newCustomers" stackId="a" fill="#3b82f6" name="New Customers" />
                <Bar
                  dataKey="returningCustomers"
                  stackId="a"
                  fill="#10b981"
                  name="Returning Customers"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance Details</CardTitle>
          <CardDescription>Comprehensive metrics for all marketing channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Channel</th>
                  <th className="text-right py-3 px-4 font-semibold">Spend</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                  <th className="text-right py-3 px-4 font-semibold">Customers</th>
                  <th className="text-right py-3 px-4 font-semibold">CAC</th>
                  <th className="text-right py-3 px-4 font-semibold">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {channelPerformance.map((channel) => (
                  <tr key={channel.channel} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{channel.channel}</td>
                    <td className="text-right py-3 px-4">${channel.spend.toLocaleString()}</td>
                    <td className="text-right py-3 px-4 text-green-600">
                      ${channel.revenue.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-blue-600">
                      {channel.roi}%
                    </td>
                    <td className="text-right py-3 px-4">{channel.customers}</td>
                    <td className="text-right py-3 px-4">${channel.cac.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">{channel.conversionRate.toFixed(1)}%</td>
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
