import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

/**
 * MarketplaceComparison Page
 * Comprehensive comparison view for all marketplace metrics
 */
export default function MarketplaceComparison() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "Gross Revenue",
    "Total Orders",
    "Conversion Rate",
  ]);

  // Fetch marketplace metrics
  const { data: metricsData, isLoading: metricsLoading } = trpc.marketplaceComparison.getAllPlatformsMetrics.useQuery({});
  const { data: summaryData, isLoading: summaryLoading } = trpc.marketplaceComparison.getComparisonSummary.useQuery({});
  const { data: trendsData, isLoading: trendsLoading } = trpc.marketplaceComparison.getMarketplaceTrends.useQuery({ days: 30 });
  const { data: topPerformers } = trpc.marketplaceComparison.getTopPerformers.useQuery({ metric: "Gross Revenue" });

  const dateRange = `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`;

  // Prepare export data
  const exportMetrics = useMemo(() => {
    if (!metricsData) return {};
    const metrics: Record<string, string | number> = {};
    metricsData.platforms.forEach(platform => {
      Object.entries(platform.metrics).forEach(([key, value]) => {
        if (!metrics[key]) {
          metrics[key] = value;
        }
      });
    });
    return metrics;
  }, [metricsData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!metricsData) return [];
    return metricsData.platforms.map(platform => ({
      name: platform.name,
      revenue: parseInt(String(platform.metrics["Gross Revenue"]).replace(/[$,]/g, "")),
      orders: parseInt(String(platform.metrics["Total Orders"]).replace(/,/g, "")),
      conversionRate: parseFloat(String(platform.metrics["Conversion Rate"]).replace(/%/g, "")),
    }));
  }, [metricsData]);

  // Color palette for charts
  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  if (metricsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Comparison</h1>
          <p className="text-gray-500 mt-2">Compare performance across all retail platforms</p>
        </div>
        <ExportButton
          title="Marketplace Comparison Report"
          dateRange={dateRange}
          metrics={exportMetrics}
          disabled={!metricsData}
        />
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.totalRevenue}</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3" />
                {summaryData.totalRevenueGrowth} vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.totalOrders}</div>
              <p className="text-xs text-gray-500 mt-2">Across all platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.avgOrderValue}</div>
              <p className="text-xs text-gray-500 mt-2">Platform average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryData.averageConversionRate}</div>
              <p className="text-xs text-gray-500 mt-2">Across all platforms</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performers">Top Performers</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Comparison</CardTitle>
              <CardDescription>Total revenue by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders Comparison</CardTitle>
              <CardDescription>Total orders by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="orders" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate Comparison</CardTitle>
              <CardDescription>Conversion rate by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(2) : value}%`} />
                  <Bar dataKey="conversionRate" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Revenue Trends</CardTitle>
              <CardDescription>Daily revenue trends across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsData && (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="amazon" stroke={COLORS[0]} />
                    <Line type="monotone" dataKey="ebay" stroke={COLORS[1]} />
                    <Line type="monotone" dataKey="walmart" stroke={COLORS[2]} />
                    <Line type="monotone" dataKey="webstores" stroke={COLORS[3]} />
                    <Line type="monotone" dataKey="tractorSupply" stroke={COLORS[4]} />
                    <Line type="monotone" dataKey="autozone" stroke={COLORS[5]} />
                    <Line type="monotone" dataKey="northernTool" stroke={COLORS[6]} />
                    <Line type="monotone" dataKey="lowes" stroke={COLORS[7]} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value="performers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest revenue platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers?.topPerformers.map((performer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{performer.platform}</p>
                        <p className="text-sm text-gray-500">#{performer.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{performer.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bottom Performers</CardTitle>
                <CardDescription>Lowest revenue platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers?.bottomPerformers.map((performer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{performer.platform}</p>
                        <p className="text-sm text-gray-500">#{performer.rank}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{performer.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Table View Tab */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics Table</CardTitle>
              <CardDescription>All platform metrics in tabular format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Platform</th>
                      <th className="text-right py-2 px-4 font-semibold">Revenue</th>
                      <th className="text-right py-2 px-4 font-semibold">Orders</th>
                      <th className="text-right py-2 px-4 font-semibold">AOV</th>
                      <th className="text-right py-2 px-4 font-semibold">Conv. Rate</th>
                      <th className="text-right py-2 px-4 font-semibold">New Customers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsData?.platforms.map((platform, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{platform.name}</td>
                        <td className="text-right py-3 px-4">{platform.metrics["Gross Revenue"]}</td>
                        <td className="text-right py-3 px-4">{platform.metrics["Total Orders"]}</td>
                        <td className="text-right py-3 px-4">{platform.metrics["Avg Order Value"]}</td>
                        <td className="text-right py-3 px-4">{platform.metrics["Conversion Rate"]}</td>
                        <td className="text-right py-3 px-4">{platform.metrics["New Customers"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
