import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Download, Calendar } from "lucide-react";
import {
  RevenueTrendChart,
  RevenueByMarketplaceChart,
  AdSpendVsRevenueChart,
  ROASTrendChart,
  TopProductsChart,
  KPICard,
  ChartContainer,
} from "@/components/DashboardCharts";
import { toast } from "sonner";

/**
 * Analytics Dashboard
 * Comprehensive user-facing dashboard with charts, KPIs, and analytics
 */

export default function AnalyticsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

  // Fetch all dashboard data
  const { data: kpiMetrics, isLoading: kpiLoading } = trpc.dashboardAnalytics.getKPIMetrics.useQuery(
    user ? { userId: user.id, startDate, endDate } : { userId: 0, startDate, endDate },
    { enabled: !!user }
  );

  const { data: revenueTrend, isLoading: trendLoading } = trpc.dashboardAnalytics.getRevenueTrend.useQuery(
    user ? { userId: user.id, startDate, endDate } : { userId: 0, startDate, endDate },
    { enabled: !!user }
  );

  const { data: revenueByMarketplace, isLoading: marketplaceLoading } =
    trpc.dashboardAnalytics.getRevenueByMarketplace.useQuery(
      user ? { userId: user.id, startDate, endDate } : { userId: 0, startDate, endDate },
      { enabled: !!user }
    );

  const { data: adSpendMetrics, isLoading: adSpendLoading } = trpc.dashboardAnalytics.getAdSpendMetrics.useQuery(
    user ? { userId: user.id, startDate, endDate } : { userId: 0, startDate, endDate },
    { enabled: !!user }
  );

  const { data: topProducts, isLoading: productsLoading } = trpc.dashboardAnalytics.getTopProducts.useQuery(
    user ? { userId: user.id, startDate, endDate, limit: 10 } : { userId: 0, startDate, endDate, limit: 10 },
    { enabled: !!user }
  );

  const { data: syncStatus, refetch: refetchSyncStatus } = trpc.dashboardAnalytics.getSyncStatus.useQuery(
    user ? { userId: user.id } : { userId: 0 },
    { enabled: !!user }
  );

  const { data: summaryStats, isLoading: statsLoading } = trpc.dashboardAnalytics.getSummaryStats.useQuery(
    user ? { userId: user.id, startDate, endDate } : { userId: 0, startDate, endDate },
    { enabled: !!user }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view analytics</p>
      </div>
    );
  }

  const handleDateChange = (type: "start" | "end", date: Date) => {
    if (type === "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const handleExport = async (format: "pdf" | "csv") => {
    setIsExporting(true);
    try {
      // Prepare export data
      const exportData = {
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        kpiMetrics,
        summaryStats,
        topProducts,
      };

      if (format === "csv") {
        // Generate CSV
        const csv = generateCSV(exportData);
        downloadFile(csv, "analytics-report.csv", "text/csv");
      } else {
        // Generate PDF (would require additional library)
        toast.info("PDF export coming soon");
      }

      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = async () => {
    await refetchSyncStatus();
    toast.success("Data refreshed");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isExporting}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Sync Status Indicator */}
        {syncStatus && (
          <Card className={`border-l-4 ${
            syncStatus.status === "fresh"
              ? "border-l-green-500 bg-green-50"
              : syncStatus.status === "recent"
              ? "border-l-yellow-500 bg-yellow-50"
              : "border-l-red-500 bg-red-50"
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {syncStatus.status === "fresh"
                      ? "✓ Data is fresh"
                      : syncStatus.status === "recent"
                      ? "⚠ Data is recent"
                      : "✗ Data needs refresh"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {syncStatus.lastSyncTime
                      ? `Last synced ${syncStatus.syncAgeMinutes} minutes ago`
                      : "No data synced yet"}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={handleRefresh}>
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate.toISOString().split("T")[0]}
                onChange={(e) => handleDateChange("start", new Date(e.target.value))}
                className="mt-2 p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate.toISOString().split("T")[0]}
                onChange={(e) => handleDateChange("end", new Date(e.target.value))}
                className="mt-2 p-2 border rounded"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = new Date();
                  date.setDate(date.getDate() - 7);
                  setStartDate(date);
                  setEndDate(new Date());
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = new Date();
                  date.setDate(date.getDate() - 30);
                  setStartDate(date);
                  setEndDate(new Date());
                }}
              >
                Last 30 Days
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Revenue"
            value={summaryStats?.totalRevenue || 0}
            format="currency"
            trend={kpiMetrics ? { value: kpiMetrics.revenueGrowth, direction: "up" } : undefined}
          />
          <KPICard
            title="Total Orders"
            value={summaryStats?.totalOrders || 0}
            format="number"
          />
          <KPICard
            title="Profit Margin"
            value={summaryStats?.profitMargin || 0}
            format="percentage"
          />
          <KPICard
            title="ROAS"
            value={summaryStats?.roas || 0}
            format="number"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <ChartContainer
            title="Revenue Trend"
            isLoading={trendLoading}
          >
            {revenueTrend && revenueTrend.length > 0 ? (
              <RevenueTrendChart data={revenueTrend} />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </ChartContainer>

          {/* Revenue by Marketplace */}
          <ChartContainer
            title="Revenue by Marketplace"
            isLoading={marketplaceLoading}
          >
            {revenueByMarketplace && revenueByMarketplace.length > 0 ? (
              <RevenueByMarketplaceChart data={revenueByMarketplace} />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </ChartContainer>

          {/* Ad Spend vs Revenue */}
          <ChartContainer
            title="Ad Spend vs Revenue"
            isLoading={adSpendLoading}
          >
            {adSpendMetrics && adSpendMetrics.length > 0 ? (
              <AdSpendVsRevenueChart data={adSpendMetrics} />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </ChartContainer>

          {/* ROAS Trend */}
          <ChartContainer
            title="ROAS Trend"
            isLoading={adSpendLoading}
          >
            {adSpendMetrics && adSpendMetrics.length > 0 ? (
              <ROASTrendChart data={adSpendMetrics} />
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </ChartContainer>
        </div>

        {/* Top Products */}
        <ChartContainer
          title="Top 10 Products by Revenue"
          isLoading={productsLoading}
        >
          {topProducts && topProducts.length > 0 ? (
            <TopProductsChart data={topProducts} />
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </ChartContainer>

        {/* Summary Statistics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>Key metrics for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${summaryStats?.totalRevenue.toFixed(2) || "0.00"}</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Total Ad Spend</p>
                <p className="text-2xl font-bold">${summaryStats?.totalAdSpend.toFixed(2) || "0.00"}</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">${summaryStats?.totalProfit.toFixed(2) || "0.00"}</p>
              </div>
              <div className="p-4 bg-muted rounded">
                <p className="text-sm text-muted-foreground">Total Units Sold</p>
                <p className="text-2xl font-bold">{summaryStats?.totalUnits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Generate CSV from export data
 */
function generateCSV(data: any): string {
  let csv = "Analytics Report\n";
  csv += `Period: ${data.period}\n\n`;

  // KPI Metrics
  csv += "KPI Metrics\n";
  csv += "Metric,Value\n";
  if (data.kpiMetrics) {
    csv += `Total Revenue,$${data.kpiMetrics.totalRevenue}\n`;
    csv += `Total Orders,${data.kpiMetrics.totalOrders}\n`;
    csv += `Average Order Value,$${data.kpiMetrics.avgOrderValue}\n`;
    csv += `Revenue Growth,${data.kpiMetrics.revenueGrowth}%\n`;
  }

  csv += "\n\nSummary Statistics\n";
  csv += "Metric,Value\n";
  if (data.summaryStats) {
    csv += `Total Revenue,$${data.summaryStats.totalRevenue}\n`;
    csv += `Total Ad Spend,$${data.summaryStats.totalAdSpend}\n`;
    csv += `Total Profit,$${data.summaryStats.totalProfit}\n`;
    csv += `Profit Margin,${data.summaryStats.profitMargin}%\n`;
    csv += `ROAS,${data.summaryStats.roas}x\n`;
  }

  csv += "\n\nTop Products\n";
  csv += "Product Name,Revenue,Quantity\n";
  if (data.topProducts) {
    data.topProducts.forEach((product: any) => {
      csv += `"${product.name}",$${product.revenue},${product.quantity}\n`;
    });
  }

  return csv;
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const element = document.createElement("a");
  element.setAttribute("href", `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
