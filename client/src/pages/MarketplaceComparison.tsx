import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ReferenceLine } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * MarketplaceComparison Page with Period-over-Period and Predictive Analysis
 */
export default function MarketplaceComparison() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "Gross Revenue",
    "Total Orders",
    "Conversion Rate",
  ]);
  const [periodType, setPeriodType] = useState<"month" | "quarter" | "year">("month");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Amazon");

  // Fetch marketplace metrics
  const { data: metricsData, isLoading: metricsLoading } = trpc.marketplaceComparison.getAllPlatformsMetrics.useQuery({});
  const { data: summaryData, isLoading: summaryLoading } = trpc.marketplaceComparison.getComparisonSummary.useQuery({});
  const { data: trendsData, isLoading: trendsLoading } = trpc.marketplaceComparison.getMarketplaceTrends.useQuery({ days: 30 });
  const { data: topPerformers } = trpc.marketplaceComparison.getTopPerformers.useQuery({ metric: "Gross Revenue" });

  // New data fetches for enhancements
  const { data: growthMetrics } = trpc.marketplaceComparison.getGrowthMetrics.useQuery({ period: periodType });
  const { data: periodComparison } = trpc.marketplaceComparison.getPeriodComparison.useQuery({ period: periodType });
  const { data: predictiveTrends } = trpc.marketplaceComparison.getPredictiveTrends.useQuery({ platform: selectedPlatform, forecastDays: 30 });

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

  // Prepare predictive chart data
  const predictiveChartData = useMemo(() => {
    if (!predictiveTrends) return [];
    const historical = predictiveTrends.historical.map((point) => ({
      date: point.date,
      actual: point.value,
      predicted: null as number | null,
      isPredicted: false,
    }));
    const predictive = predictiveTrends.predictive.map(point => ({
      date: point.date,
      actual: null as number | null,
      predicted: point.predicted,
      isPredicted: true,
      confidence: point.confidence,
    }));
    return [...historical, ...predictive];
  }, [predictiveTrends]);

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
      {/* Header with Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Comparison</h1>
          <p className="text-gray-500 mt-2">Compare performance across all retail platforms</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            <span className="text-sm font-medium">Period:</span>
            <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ExportButton
            title="Marketplace Comparison Report"
            dateRange={dateRange}
            metrics={exportMetrics}
            disabled={!metricsData}
          />
        </div>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictive">Forecast</TabsTrigger>
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

        {/* Growth Metrics Tab */}
        <TabsContent value="growth" className="space-y-4">
          {growthMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{growthMetrics.summary.avgGrowthPercent}</div>
                    <p className="text-xs text-gray-500 mt-2">Across all platforms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Grower</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{growthMetrics.summary.topGrower}</div>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                      <ArrowUp className="h-3 w-3" />
                      {growthMetrics.summary.topGrowerPercent}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Fastest Declining</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{growthMetrics.summary.topDecliner}</div>
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                      <ArrowDown className="h-3 w-3" />
                      {growthMetrics.summary.topDeclinerPercent}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth Rates</CardTitle>
                  <CardDescription>Revenue growth comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {growthMetrics.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{metric.platform}</p>
                          <p className="text-xs text-gray-500">
                            ${metric.previousRevenue.toLocaleString()} → ${metric.currentRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.growthPercent}
                          </p>
                          <p className="text-xs text-gray-500">{metric.trendStrength} {metric.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
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

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
              <CardDescription>30-day predictive trend with confidence interval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium">Select Platform:</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-40 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="eBay">eBay</SelectItem>
                    <SelectItem value="Walmart">Walmart</SelectItem>
                    <SelectItem value="WebStores">WebStores</SelectItem>
                    <SelectItem value="Tractor Supply">Tractor Supply</SelectItem>
                    <SelectItem value="AutoZone">AutoZone</SelectItem>
                    <SelectItem value="Northern Tool">Northern Tool</SelectItem>
                    <SelectItem value="Lowe's">Lowe's</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {predictiveTrends && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={predictiveChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => value ? `$${value.toLocaleString()}` : 'N/A'}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#3b82f6" 
                      name="Historical Data"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#f59e0b" 
                      strokeDasharray="5 5"
                      name="Forecast"
                      dot={false}
                    />
                    <ReferenceLine 
                      x={predictiveTrends.historical[predictiveTrends.historical.length - 1].date}
                      stroke="#666"
                      strokeDasharray="3 3"
                      label="Today"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}

              {predictiveTrends && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium">Forecast Confidence: {(predictiveTrends.confidence * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Based on 30-day historical data using linear regression analysis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
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
