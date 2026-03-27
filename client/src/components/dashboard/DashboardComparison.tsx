import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ComparisonType = "period" | "platform";
type PeriodType = "week" | "month" | "quarter" | "year";
type PlatformType = "amazon" | "ebay" | "walmart" | "webstores" | "tractorsupply" | "autozone" | "northerntool" | "lowes";

interface ComparisonMetric {
  label: string;
  value1: number;
  value2: number;
  unit: string;
  format: "currency" | "percentage" | "number";
}

interface PeriodData {
  period: string;
  revenue: number;
  orders: number;
  aov: number;
  conversionRate: number;
  roi: number;
  customers: number;
}

interface PlatformData {
  platform: string;
  revenue: number;
  orders: number;
  aov: number;
  conversionRate: number;
  roi: number;
  customers: number;
}

// Mock data for period comparison
const generatePeriodData = (period: PeriodType): PeriodData[] => {
  const baseData = {
    revenue: 2450000,
    orders: 1247,
    aov: 1964,
    conversionRate: 4.2,
    roi: 3.8,
    customers: 892,
  };

  if (period === "week") {
    return [
      { period: "Week 1", ...baseData, revenue: 580000, orders: 295 },
      { period: "Week 2", ...baseData, revenue: 612000, orders: 310 },
    ];
  } else if (period === "month") {
    return [
      { period: "This Month", ...baseData },
      { period: "Last Month", revenue: 2180000, orders: 1105, aov: 1973, conversionRate: 3.9, roi: 3.5, customers: 821 },
    ];
  } else if (period === "quarter") {
    return [
      { period: "Q1 2026", revenue: 7350000, orders: 3741, aov: 1964, conversionRate: 4.2, roi: 3.8, customers: 2676 },
      { period: "Q4 2025", revenue: 6820000, orders: 3465, aov: 1968, conversionRate: 4.0, roi: 3.6, customers: 2503 },
    ];
  } else {
    return [
      { period: "2026", revenue: 29400000, orders: 14968, aov: 1964, conversionRate: 4.2, roi: 3.8, customers: 10704 },
      { period: "2025", revenue: 27280000, orders: 13860, aov: 1968, conversionRate: 4.0, roi: 3.6, customers: 10012 },
    ];
  }
};

// Mock data for platform comparison
const generatePlatformData = (): PlatformData[] => {
  return [
    { platform: "Amazon", revenue: 980000, orders: 498, aov: 1968, conversionRate: 4.5, roi: 4.2, customers: 356 },
    { platform: "eBay", revenue: 520000, orders: 264, aov: 1970, conversionRate: 3.8, roi: 3.4, customers: 189 },
    { platform: "Walmart", revenue: 450000, orders: 228, aov: 1974, conversionRate: 4.1, roi: 3.7, customers: 163 },
    { platform: "WebStores", revenue: 320000, orders: 162, aov: 1975, conversionRate: 3.9, roi: 3.5, customers: 116 },
    { platform: "Tractor Supply", revenue: 95000, orders: 48, aov: 1979, conversionRate: 3.6, roi: 3.2, customers: 34 },
    { platform: "AutoZone", revenue: 55000, orders: 28, aov: 1964, conversionRate: 3.4, roi: 3.0, customers: 20 },
    { platform: "Northern Tool", revenue: 22000, orders: 11, aov: 2000, conversionRate: 3.5, roi: 3.1, customers: 8 },
    { platform: "Lowe's", revenue: 8000, orders: 4, aov: 2000, conversionRate: 3.2, roi: 2.8, customers: 3 },
  ];
};

const formatValue = (value: number, format: "currency" | "percentage" | "number"): string => {
  if (format === "currency") {
    return `$${(value / 1000).toFixed(1)}K`;
  } else if (format === "percentage") {
    return `${value.toFixed(2)}%`;
  }
  return value.toLocaleString();
};

const calculateChange = (value1: number, value2: number): { percentage: number; isPositive: boolean } => {
  const change = ((value1 - value2) / value2) * 100;
  return {
    percentage: Math.abs(change),
    isPositive: change >= 0,
  };
};

export default function DashboardComparison() {
  const [comparisonType, setComparisonType] = useState<ComparisonType>("period");
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(["amazon", "ebay"]);

  const periodData = generatePeriodData(periodType);
  const platformData = generatePlatformData();

  const getComparisonMetrics = (): ComparisonMetric[] => {
    if (comparisonType === "period" && periodData.length >= 2) {
      const data1 = periodData[0];
      const data2 = periodData[1];
      return [
        { label: "Total Revenue", value1: data1.revenue, value2: data2.revenue, unit: "USD", format: "currency" },
        { label: "Total Orders", value1: data1.orders, value2: data2.orders, unit: "orders", format: "number" },
        { label: "Average Order Value", value1: data1.aov, value2: data2.aov, unit: "USD", format: "currency" },
        { label: "Conversion Rate", value1: data1.conversionRate, value2: data2.conversionRate, unit: "%", format: "percentage" },
        { label: "ROI", value1: data1.roi, value2: data2.roi, unit: "x", format: "percentage" },
        { label: "New Customers", value1: data1.customers, value2: data2.customers, unit: "customers", format: "number" },
      ];
    } else if (comparisonType === "platform" && selectedPlatforms.length >= 2) {
      const platform1 = platformData.find(p => p.platform.toLowerCase().replace(" ", "") === selectedPlatforms[0]);
      const platform2 = platformData.find(p => p.platform.toLowerCase().replace(" ", "") === selectedPlatforms[1]);
      
      if (platform1 && platform2) {
        return [
          { label: "Total Revenue", value1: platform1.revenue, value2: platform2.revenue, unit: "USD", format: "currency" },
          { label: "Total Orders", value1: platform1.orders, value2: platform2.orders, unit: "orders", format: "number" },
          { label: "Average Order Value", value1: platform1.aov, value2: platform2.aov, unit: "USD", format: "currency" },
          { label: "Conversion Rate", value1: platform1.conversionRate, value2: platform2.conversionRate, unit: "%", format: "percentage" },
          { label: "ROI", value1: platform1.roi, value2: platform2.roi, unit: "x", format: "percentage" },
          { label: "New Customers", value1: platform1.customers, value2: platform2.customers, unit: "customers", format: "number" },
        ];
      }
    }
    return [];
  };

  const metrics = getComparisonMetrics();
  const chartData = comparisonType === "period" 
    ? periodData.map(d => ({
        name: d.period,
        revenue: d.revenue / 1000000,
        orders: d.orders / 100,
        aov: d.aov,
        roi: d.roi,
      }))
    : platformData
        .filter(p => selectedPlatforms.includes(p.platform.toLowerCase().replace(" ", "") as PlatformType))
        .map(p => ({
          name: p.platform,
          revenue: p.revenue / 1000000,
          orders: p.orders / 100,
          aov: p.aov,
          roi: p.roi,
        }));

  const platformsForChart = platformData.filter(p => 
    selectedPlatforms.includes(p.platform.toLowerCase().replace(" ", "") as PlatformType)
  );

  const platformRevenueData = platformsForChart.map(p => ({
    name: p.platform,
    value: p.revenue,
  }));

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Comparison</h1>
        <p className="text-muted-foreground mt-2">Compare metrics across different time periods or platforms</p>
      </div>

      {/* Comparison Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Settings</CardTitle>
          <CardDescription>Select what you want to compare</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comparison Type</label>
              <Select value={comparisonType} onValueChange={(value) => setComparisonType(value as ComparisonType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="period">Compare Time Periods</SelectItem>
                  <SelectItem value="platform">Compare Platforms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {comparisonType === "period" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Period Type</label>
                <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {comparisonType === "platform" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Platforms to Compare</label>
                <div className="flex flex-wrap gap-2">
                  {["amazon", "ebay", "walmart", "webstores"].map((platform) => (
                    <Button
                      key={platform}
                      variant={selectedPlatforms.includes(platform as PlatformType) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          prev.includes(platform as PlatformType)
                            ? prev.filter(p => p !== platform)
                            : [...prev, platform as PlatformType]
                        );
                      }}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Cards */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.value1, metric.value2);
            const label1 = comparisonType === "period" ? periodData[0]?.period : platformData.find(p => p.platform.toLowerCase().replace(" ", "") === selectedPlatforms[0])?.platform;
            const label2 = comparisonType === "period" ? periodData[1]?.period : platformData.find(p => p.platform.toLowerCase().replace(" ", "") === selectedPlatforms[1])?.platform;

            return (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{metric.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{label1}</span>
                      <span className="font-semibold text-lg">{formatValue(metric.value1, metric.format)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{label2}</span>
                      <span className="font-semibold text-lg">{formatValue(metric.value2, metric.format)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 pt-2 border-t ${change.isPositive ? "text-green-600" : "text-red-600"}`}>
                    {change.isPositive ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{change.percentage.toFixed(1)}% difference</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue and Orders Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders Comparison</CardTitle>
            <CardDescription>Side-by-side revenue and order metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($M)" />
                <Bar yAxisId="right" dataKey="orders" fill="#10b981" name="Orders (100s)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AOV and ROI Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>AOV & ROI Comparison</CardTitle>
            <CardDescription>Average order value and return on investment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="aov" stroke="#3b82f6" name="AOV ($)" />
                <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#ef4444" name="ROI (x)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Revenue Distribution */}
      {comparisonType === "platform" && platformRevenueData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Platform Revenue Distribution</CardTitle>
            <CardDescription>Revenue breakdown by selected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Comparison Table */}
      {comparisonType === "platform" && platformsForChart.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Platform Metrics</CardTitle>
            <CardDescription>Complete metrics for selected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-semibold">Platform</th>
                    <th className="text-right py-2 px-2 font-semibold">Revenue</th>
                    <th className="text-right py-2 px-2 font-semibold">Orders</th>
                    <th className="text-right py-2 px-2 font-semibold">AOV</th>
                    <th className="text-right py-2 px-2 font-semibold">Conv. Rate</th>
                    <th className="text-right py-2 px-2 font-semibold">ROI</th>
                    <th className="text-right py-2 px-2 font-semibold">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {platformsForChart.map((platform) => (
                    <tr key={platform.platform} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{platform.platform}</td>
                      <td className="text-right py-2 px-2">${(platform.revenue / 1000000).toFixed(2)}M</td>
                      <td className="text-right py-2 px-2">{platform.orders}</td>
                      <td className="text-right py-2 px-2">${platform.aov}</td>
                      <td className="text-right py-2 px-2">{platform.conversionRate.toFixed(2)}%</td>
                      <td className="text-right py-2 px-2">{platform.roi.toFixed(2)}x</td>
                      <td className="text-right py-2 px-2">{platform.customers}</td>
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
