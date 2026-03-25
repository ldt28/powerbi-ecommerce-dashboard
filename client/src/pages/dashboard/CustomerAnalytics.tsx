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
import { TrendingUp, Users, DollarSign, RotateCw } from "lucide-react";

/**
 * Customer Analytics Dashboard
 * Tracks new customer acquisition, lifetime value, retention rates, and customer segmentation
 */

// Mock data for customer metrics
const generateCustomerData = (days: number) => {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      newCustomers: Math.floor(Math.random() * 150) + 50,
      returningCustomers: Math.floor(Math.random() * 200) + 100,
      churnedCustomers: Math.floor(Math.random() * 30) + 5,
    });
  }
  return data;
};

const ltvDistribution = [
  { range: "$0-100", customers: 450, value: 28 },
  { range: "$100-500", customers: 380, value: 32 },
  { range: "$500-1000", customers: 220, value: 22 },
  { range: "$1000-5000", customers: 95, value: 12 },
  { range: "$5000+", customers: 35, value: 6 },
];

const retentionByMonth = [
  { month: "Month 1", retention: 100 },
  { month: "Month 2", retention: 68 },
  { month: "Month 3", retention: 52 },
  { month: "Month 4", retention: 41 },
  { month: "Month 5", retention: 35 },
  { month: "Month 6", retention: 28 },
  { month: "Month 12", retention: 15 },
];

const customerSegmentation = [
  { segment: "VIP", customers: 85, avgLTV: 3200, retention: 92 },
  { segment: "High Value", customers: 245, avgLTV: 1450, retention: 68 },
  { segment: "Regular", customers: 680, avgLTV: 380, retention: 42 },
  { segment: "At Risk", customers: 320, avgLTV: 120, retention: 8 },
  { segment: "Dormant", customers: 1200, avgLTV: 45, retention: 0 },
];

const channelAcquisition = [
  { channel: "Organic", value: 35, customers: 420 },
  { channel: "Paid Search", value: 28, customers: 336 },
  { channel: "Social Media", value: 18, customers: 216 },
  { channel: "Referral", value: 12, customers: 144 },
  { channel: "Direct", value: 7, customers: 84 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function CustomerAnalytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const customerData = generateCustomerData(90);
  const totalNewCustomers = customerData.reduce((sum, d) => sum + d.newCustomers, 0);
  const totalReturningCustomers = customerData.reduce((sum, d) => sum + d.returningCustomers, 0);
  const totalChurned = customerData.reduce((sum, d) => sum + d.churnedCustomers, 0);
  const avgCustomerLTV = 542;
  const retentionRate = 42;
  const repurchaseRate = 38;

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange({ startDate: range.from, endDate: range.to });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track customer acquisition, lifetime value, and retention metrics
          </p>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="month" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Customer LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgCustomerLTV}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+8.3% vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <RotateCw className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionRate}%</div>
            <p className="text-xs text-muted-foreground">Month 6 retention</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+3.2% vs previous cohort</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repurchase Rate</CardTitle>
            <RotateCw className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repurchaseRate}%</div>
            <p className="text-xs text-muted-foreground">Customers with 2+ orders</p>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+5.1% vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Acquisition Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition Trend</CardTitle>
            <CardDescription>New vs returning customers over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#3b82f6"
                  name="New Customers"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="returningCustomers"
                  stroke="#10b981"
                  name="Returning Customers"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Retention Curve */}
        <Card>
          <CardHeader>
            <CardTitle>Retention Curve</CardTitle>
            <CardDescription>Customer retention by cohort age</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#8b5cf6"
                  name="Retention %"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LTV Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>LTV Distribution</CardTitle>
            <CardDescription>Customer count by lifetime value range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ltvDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#3b82f6" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Acquisition Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Channels</CardTitle>
            <CardDescription>Customer acquisition by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelAcquisition}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ channel, value }) => `${channel} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelAcquisition.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segmentation */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
          <CardDescription>Performance metrics by customer segment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Segment</th>
                  <th className="text-right py-3 px-4 font-semibold">Customers</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg LTV</th>
                  <th className="text-right py-3 px-4 font-semibold">Retention</th>
                  <th className="text-right py-3 px-4 font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {customerSegmentation.map((segment, idx) => {
                  const totalCustomers = customerSegmentation.reduce((sum, s) => sum + s.customers, 0);
                  const percentage = ((segment.customers / totalCustomers) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{segment.segment}</td>
                      <td className="text-right py-3 px-4">{segment.customers.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">${segment.avgLTV.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">{segment.retention}%</td>
                      <td className="text-right py-3 px-4">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Cohort Analysis</CardTitle>
          <CardDescription>Retention and LTV by acquisition month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Cohort</th>
                  <th className="text-right py-3 px-4 font-semibold">Size</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg LTV</th>
                  <th className="text-right py-3 px-4 font-semibold">M1</th>
                  <th className="text-right py-3 px-4 font-semibold">M3</th>
                  <th className="text-right py-3 px-4 font-semibold">M6</th>
                  <th className="text-right py-3 px-4 font-semibold">M12</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: "Jan 2026", size: 450, ltv: 680, m1: 100, m3: 58, m6: 42, m12: 18 },
                  { month: "Feb 2026", size: 520, ltv: 620, m1: 100, m3: 62, m6: 45, m12: null },
                  { month: "Mar 2026", size: 480, ltv: 540, m1: 100, m3: 65, m6: null, m12: null },
                ].map((cohort, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{cohort.month}</td>
                    <td className="text-right py-3 px-4">{cohort.size.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">${cohort.ltv}</td>
                    <td className="text-right py-3 px-4">{cohort.m1}%</td>
                    <td className="text-right py-3 px-4">{cohort.m3}%</td>
                    <td className="text-right py-3 px-4">{cohort.m6}%</td>
                    <td className="text-right py-3 px-4">{cohort.m12 ? `${cohort.m12}%` : "—"}</td>
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
