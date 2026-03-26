import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/DateRangeFilter";
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
import { Mail, TrendingUp, Users, DollarSign, MousePointer } from "lucide-react";

/**
 * Email Marketing Dashboard
 * Tracks email campaign performance, engagement metrics, ROI, and impact on customer segments
 */

// Mock data for email campaigns
const campaignPerformance = [
  {
    campaign: "Welcome Series",
    sent: 5200,
    opened: 1560,
    clicked: 312,
    converted: 78,
    revenue: 12480,
    openRate: 30,
    clickRate: 6,
    conversionRate: 1.5,
  },
  {
    campaign: "Spring Sale",
    sent: 8500,
    opened: 3145,
    clicked: 755,
    converted: 227,
    revenue: 45400,
    openRate: 37,
    clickRate: 8.9,
    conversionRate: 2.7,
  },
  {
    campaign: "Product Restock",
    sent: 6200,
    opened: 1550,
    clicked: 310,
    converted: 62,
    revenue: 9920,
    openRate: 25,
    clickRate: 5,
    conversionRate: 1,
  },
  {
    campaign: "VIP Exclusive",
    sent: 1200,
    opened: 600,
    clicked: 180,
    converted: 54,
    revenue: 16200,
    openRate: 50,
    clickRate: 15,
    conversionRate: 4.5,
  },
  {
    campaign: "Abandoned Cart",
    sent: 3800,
    opened: 1330,
    clicked: 266,
    converted: 95,
    revenue: 14250,
    openRate: 35,
    clickRate: 7,
    conversionRate: 2.5,
  },
];

const engagementTrend = [
  { week: "Week 1", opens: 2400, clicks: 480, conversions: 72 },
  { week: "Week 2", opens: 2800, clicks: 560, conversions: 84 },
  { week: "Week 3", opens: 2200, clicks: 440, conversions: 66 },
  { week: "Week 4", opens: 3200, clicks: 640, conversions: 96 },
  { week: "Week 5", opens: 3600, clicks: 720, conversions: 108 },
  { week: "Week 6", opens: 3100, clicks: 620, conversions: 93 },
  { week: "Week 7", opens: 3800, clicks: 760, conversions: 114 },
  { week: "Week 8", opens: 4100, clicks: 820, conversions: 123 },
];

const segmentPerformance = [
  { segment: "VIP", sent: 1200, openRate: 52, clickRate: 18, conversionRate: 5.2, revenue: 18720 },
  { segment: "High Value", sent: 3500, openRate: 42, clickRate: 12, conversionRate: 3.8, revenue: 42840 },
  { segment: "Regular", sent: 8200, openRate: 28, clickRate: 5, conversionRate: 1.2, revenue: 23640 },
  { segment: "At Risk", sent: 2100, openRate: 18, clickRate: 2, conversionRate: 0.3, revenue: 1890 },
];

const deviceBreakdown = [
  { device: "Mobile", percentage: 62, opens: 3100, clicks: 620 },
  { device: "Desktop", percentage: 28, opens: 1400, clicks: 280 },
  { device: "Tablet", percentage: 10, opens: 500, clicks: 100 },
];

const timeOfDayPerformance = [
  { hour: "6am", openRate: 8, clickRate: 1.2 },
  { hour: "9am", openRate: 28, clickRate: 5.6 },
  { hour: "12pm", openRate: 35, clickRate: 7 },
  { hour: "3pm", openRate: 32, clickRate: 6.4 },
  { hour: "6pm", openRate: 38, clickRate: 7.6 },
  { hour: "9pm", openRate: 25, clickRate: 5 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function EmailMarketing() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const totalSent = campaignPerformance.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaignPerformance.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = campaignPerformance.reduce((sum, c) => sum + c.clicked, 0);
  const totalConverted = campaignPerformance.reduce((sum, c) => sum + c.converted, 0);
  const totalRevenue = campaignPerformance.reduce((sum, c) => sum + c.revenue, 0);

  const avgOpenRate = (totalOpened / totalSent) * 100;
  const avgClickRate = (totalClicked / totalSent) * 100;
  const avgConversionRate = (totalConverted / totalSent) * 100;
  const emailROI = totalRevenue / (totalSent * 0.5); // Assuming $0.50 cost per email

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange({ startDate: range.from, endDate: range.to });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Marketing</h1>
          <p className="text-muted-foreground mt-2">
            Track email campaign performance, engagement, and revenue impact
          </p>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="month" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalSent / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+18.2% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across campaigns</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+2.4% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClickRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Average across campaigns</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+1.8% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Average across campaigns</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+0.6% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Total revenue generated</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+22.5% vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
            <CardDescription>Opens, clicks, and conversions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="#3b82f6"
                  name="Opens"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#10b981"
                  name="Clicks"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#f59e0b"
                  name="Conversions"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Open rate by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="campaign" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
                <Bar dataKey="openRate" fill="#3b82f6" name="Open Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Segment Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Segment Performance</CardTitle>
            <CardDescription>Engagement metrics by customer segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="openRate" fill="#3b82f6" name="Open Rate %" />
                <Bar dataKey="clickRate" fill="#10b981" name="Click Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Email opens by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, percentage }) => `${device} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="percentage"
                >
                  {deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Send Time */}
        <Card>
          <CardHeader>
            <CardTitle>Best Send Time</CardTitle>
            <CardDescription>Open rate by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeOfDayPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="openRate"
                  stroke="#3b82f6"
                  name="Open Rate %"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="clickRate"
                  stroke="#10b981"
                  name="Click Rate %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Campaign */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Campaign</CardTitle>
            <CardDescription>Total revenue generated per campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="campaign" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${typeof value === 'number' ? value.toLocaleString() : value}`} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Comprehensive metrics for all email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Campaign</th>
                  <th className="text-right py-3 px-4 font-semibold">Sent</th>
                  <th className="text-right py-3 px-4 font-semibold">Opened</th>
                  <th className="text-right py-3 px-4 font-semibold">Open %</th>
                  <th className="text-right py-3 px-4 font-semibold">Clicked</th>
                  <th className="text-right py-3 px-4 font-semibold">Click %</th>
                  <th className="text-right py-3 px-4 font-semibold">Conversions</th>
                  <th className="text-right py-3 px-4 font-semibold">Conv %</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {campaignPerformance.map((campaign, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{campaign.campaign}</td>
                    <td className="text-right py-3 px-4">{campaign.sent.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{campaign.opened.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{campaign.openRate}%</td>
                    <td className="text-right py-3 px-4">{campaign.clicked}</td>
                    <td className="text-right py-3 px-4">{campaign.clickRate.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4">{campaign.converted}</td>
                    <td className="text-right py-3 px-4">{campaign.conversionRate.toFixed(2)}%</td>
                    <td className="text-right py-3 px-4 font-semibold text-green-600">
                      ${campaign.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Segment Impact Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Impact Analysis</CardTitle>
          <CardDescription>Email performance and revenue impact by customer segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Segment</th>
                  <th className="text-right py-3 px-4 font-semibold">Sent</th>
                  <th className="text-right py-3 px-4 font-semibold">Open Rate</th>
                  <th className="text-right py-3 px-4 font-semibold">Click Rate</th>
                  <th className="text-right py-3 px-4 font-semibold">Conv Rate</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue/Email</th>
                </tr>
              </thead>
              <tbody>
                {segmentPerformance.map((segment, idx) => {
                  const revenuePerEmail = (segment.revenue / segment.sent).toFixed(2);
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{segment.segment}</td>
                      <td className="text-right py-3 px-4">{segment.sent.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{segment.openRate}%</td>
                      <td className="text-right py-3 px-4">{segment.clickRate}%</td>
                      <td className="text-right py-3 px-4">{segment.conversionRate.toFixed(2)}%</td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">
                        ${segment.revenue.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4">${revenuePerEmail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
