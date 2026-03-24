import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useState } from "react";
import { DateRangeFilter, type DateRange } from "@/components/DateRangeFilter";

export default function MarketingPerformance() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const { data: adSpendData, isLoading } = trpc.dashboard.getAdSpendData.useQuery({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  if (isLoading) {
    return <div className="p-8">Loading marketing data...</div>;
  }

  // Calculate summary metrics
  const totalAdSpend = adSpendData?.reduce((sum, item) => sum + parseFloat(item.adSpend as any), 0) || 0;
  const totalRevenue = adSpendData?.reduce((sum, item) => sum + parseFloat(item.revenueFromAds as any), 0) || 0;
  const totalConversions = adSpendData?.reduce((sum, item) => sum + item.conversions, 0) || 0;
  const totalImpressions = adSpendData?.reduce((sum, item) => sum + item.impressions, 0) || 0;

  const roas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend).toFixed(2) : "0.00";
  const cpa = totalConversions > 0 ? (totalAdSpend / totalConversions).toFixed(2) : "0.00";
  const ctr = totalImpressions > 0 ? ((adSpendData?.reduce((sum, item) => sum + item.clicks, 0) || 0) / totalImpressions * 100).toFixed(2) : "0.00";

  // Group by marketplace
  const byMarketplace: Record<string, { spend: number; revenue: number; conversions: number; roas: number }> = {};
  adSpendData?.forEach((item) => {
    if (!byMarketplace[item.marketplace]) {
      byMarketplace[item.marketplace] = { spend: 0, revenue: 0, conversions: 0, roas: 0 };
    }
    byMarketplace[item.marketplace].spend += parseFloat(item.adSpend as any);
    byMarketplace[item.marketplace].revenue += parseFloat(item.revenueFromAds as any);
    byMarketplace[item.marketplace].conversions += item.conversions;
  });

  Object.keys(byMarketplace).forEach((key) => {
    byMarketplace[key].roas = byMarketplace[key].spend > 0 ? byMarketplace[key].revenue / byMarketplace[key].spend : 0;
  });

  const marketplaceData = Object.entries(byMarketplace).map(([name, data]) => ({
    name,
    spend: data.spend,
    revenue: data.revenue,
    roas: parseFloat(data.roas.toFixed(2)),
  }));

  // Group by date for trend
  const byDate: Record<string, { spend: number; revenue: number; roas: number }> = {};
  adSpendData?.forEach((item) => {
    const date = format(new Date(item.date), "MMM dd");
    if (!byDate[date]) {
      byDate[date] = { spend: 0, revenue: 0, roas: 0 };
    }
    byDate[date].spend += parseFloat(item.adSpend as any);
    byDate[date].revenue += parseFloat(item.revenueFromAds as any);
  });

  const trendData = Object.entries(byDate).map(([date, data]) => ({
    date,
    spend: data.spend,
    revenue: data.revenue,
    roas: data.spend > 0 ? parseFloat((data.revenue / data.spend).toFixed(2)) : 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketing Performance</h1>
          <p className="text-gray-500 mt-2">Track your ad spend and ROI across all channels</p>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="month" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ad Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAdSpend.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">All channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ROAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roas}x</div>
            <p className="text-xs text-gray-500 mt-1">Return on ad spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cpa}</div>
            <p className="text-xs text-gray-500 mt-1">Cost per acquisition</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr}%</div>
            <p className="text-xs text-gray-500 mt-1">Click-through rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ROAS Trend */}
        <Card>
          <CardHeader>
            <CardTitle>ROAS Trend</CardTitle>
            <CardDescription>Return on ad spend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${value.toFixed(2)}x`} />
                <Line type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ad Spend vs Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Spend vs Revenue</CardTitle>
            <CardDescription>Daily comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="spend" fill="#ef4444" name="Ad Spend" />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Marketplace Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Marketplace Performance</CardTitle>
            <CardDescription>Ad spend and ROAS by channel</CardDescription>
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
                <Bar yAxisId="left" dataKey="spend" fill="#ef4444" name="Ad Spend ($)" />
                <Bar yAxisId="right" dataKey="roas" fill="#10b981" name="ROAS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
