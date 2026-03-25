import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter 
} from "recharts";
import { useState } from "react";
import { TrendingUp, Package, DollarSign, Percent, AlertCircle } from "lucide-react";
import { DateRangeFilter, type DateRange } from "@/components/DateRangeFilter";
import { format } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

interface ProductMetrics {
  name: string;
  sku: string;
  revenue: number;
  quantity: number;
  profit: number;
  margin: number;
  cogs: number;
  category?: string;
}

interface CategoryMetrics {
  category: string;
  revenue: number;
  profit: number;
  margin: number;
  productCount: number;
}

export default function ProductAnalysis() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const { data: salesData, isLoading } = trpc.dashboard.getSalesData.useQuery({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading product data...</div>;
  }

  // Group by product SKU
  const byProduct: Record<string, ProductMetrics> = {};
  salesData?.forEach((item) => {
    const sku = item.productSku || "Unknown";
    if (!byProduct[sku]) {
      byProduct[sku] = {
        name: item.productName || sku,
        sku,
        revenue: 0,
        quantity: 0,
        profit: 0,
        margin: 0,
        cogs: 0,
        category: item.productName?.split(" ")[0] || "Uncategorized", // Simple categorization
      };
    }
    byProduct[sku].revenue += parseFloat(item.revenue as any);
    byProduct[sku].quantity += item.quantity;
    byProduct[sku].profit += parseFloat(item.profit as any);
    byProduct[sku].cogs += parseFloat(item.cogs as any) || 0;
  });

  // Calculate margins
  Object.keys(byProduct).forEach((key) => {
    byProduct[key].margin = byProduct[key].revenue > 0 ? (byProduct[key].profit / byProduct[key].revenue) * 100 : 0;
  });

  // Get top 10 products by revenue
  const topProducts = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((p) => ({
      ...p,
      margin: parseFloat(p.margin.toFixed(2)),
    }));

  // Get bottom performers (lowest margin)
  const bottomPerformers = Object.values(byProduct)
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 5)
    .map((p) => ({
      ...p,
      margin: parseFloat(p.margin.toFixed(2)),
    }));

  // Category breakdown
  const byCategory: Record<string, CategoryMetrics> = {};
  Object.values(byProduct).forEach((product) => {
    const cat = product.category || "Uncategorized";
    if (!byCategory[cat]) {
      byCategory[cat] = {
        category: cat,
        revenue: 0,
        profit: 0,
        margin: 0,
        productCount: 0,
      };
    }
    byCategory[cat].revenue += product.revenue;
    byCategory[cat].profit += product.profit;
    byCategory[cat].productCount += 1;
  });

  Object.keys(byCategory).forEach((key) => {
    byCategory[key].margin = byCategory[key].revenue > 0 ? (byCategory[key].profit / byCategory[key].revenue) * 100 : 0;
  });

  const categoryData = Object.values(byCategory)
    .sort((a, b) => b.revenue - a.revenue)
    .map((c) => ({
      ...c,
      margin: parseFloat(c.margin.toFixed(2)),
    }));

  // Calculate summary metrics
  const totalRevenue = salesData?.reduce((sum, item) => sum + parseFloat(item.revenue as any), 0) || 0;
  const totalProfit = salesData?.reduce((sum, item) => sum + parseFloat(item.profit as any), 0) || 0;
  const totalCogs = salesData?.reduce((sum, item) => sum + parseFloat(item.cogs as any) || 0, 0) || 0;
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const totalUnits = salesData?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const avgUnitPrice = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  // Profit vs Margin scatter data (top 15 products)
  const profitMarginScatter = Object.values(byProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15)
    .map((p) => ({
      name: p.name,
      profit: parseFloat(p.profit.toFixed(2)),
      margin: parseFloat(p.margin.toFixed(2)),
      revenue: parseFloat(p.revenue.toFixed(2)),
    }));

  // Revenue trend by day
  const byDate: Record<string, { revenue: number; profit: number; units: number }> = {};
  salesData?.forEach((item) => {
    const date = format(new Date(item.orderDate), "MMM dd");
    if (!byDate[date]) {
      byDate[date] = { revenue: 0, profit: 0, units: 0 };
    }
    byDate[date].revenue += parseFloat(item.revenue as any);
    byDate[date].profit += parseFloat(item.profit as any);
    byDate[date].units += item.quantity;
  });

  const trendData = Object.entries(byDate)
    .map(([date, data]) => ({
      date,
      revenue: parseFloat(data.revenue.toFixed(2)),
      profit: parseFloat(data.profit.toFixed(2)),
      units: data.units,
    }))
    .slice(-30); // Last 30 days

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Analysis</h1>
          <p className="text-muted-foreground mt-2">Track your top-performing products and profit margins</p>
        </div>
        <DateRangeFilter onDateRangeChange={handleDateRangeChange} defaultRange="quarter" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-1">From {Object.keys(byProduct).length} products</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalProfit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-green-600 mt-1">{avgMargin.toFixed(1)}% avg margin</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Units Sold</CardTitle>
              <Package className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalUnits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Avg ${avgUnitPrice.toFixed(2)} per unit</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">COGS</CardTitle>
              <Percent className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalCogs.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{((totalCogs / totalRevenue) * 100).toFixed(1)}% of revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profit Trend</CardTitle>
          <CardDescription>Daily revenue and profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue ($)" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10b981" name="Profit ($)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products by Revenue</CardTitle>
            <CardDescription>Best performing SKUs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margin Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin by Product</CardTitle>
            <CardDescription>Top 10 products margin comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: any) => typeof value === 'number' ? `${value.toFixed(2)}%` : value} />
                <Bar dataKey="margin" fill="#10b981" name="Margin (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Product category distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: $${(value / 1000).toFixed(0)}k`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit vs Margin Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Profit vs Margin Analysis</CardTitle>
            <CardDescription>Top 15 products: profit vs margin relationship</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="margin" name="Margin (%)" />
                <YAxis dataKey="profit" name="Profit ($)" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value} />
                <Scatter name="Products" data={profitMarginScatter} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Detailed metrics by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4">Category</th>
                  <th className="text-right py-2 px-4">Revenue</th>
                  <th className="text-right py-2 px-4">Profit</th>
                  <th className="text-right py-2 px-4">Margin</th>
                  <th className="text-right py-2 px-4">Products</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((category, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{category.category}</td>
                    <td className="text-right py-2 px-4">${category.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-4">${category.profit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-4 font-semibold text-green-600">{category.margin.toFixed(2)}%</td>
                    <td className="text-right py-2 px-4">{category.productCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Products - Detailed Metrics</CardTitle>
          <CardDescription>Comprehensive product performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-4">Product</th>
                  <th className="text-right py-2 px-4">Revenue</th>
                  <th className="text-right py-2 px-4">Units</th>
                  <th className="text-right py-2 px-4">COGS</th>
                  <th className="text-right py-2 px-4">Profit</th>
                  <th className="text-right py-2 px-4">Margin</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </td>
                    <td className="text-right py-2 px-4">${product.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-4">{product.quantity}</td>
                    <td className="text-right py-2 px-4">${product.cogs.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-4">${product.profit.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                    <td className="text-right py-2 px-4 font-semibold">{product.margin.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Low Margin Products Alert */}
      {bottomPerformers.length > 0 && (
        <Card className="border-orange-200/50 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <CardTitle>Low Margin Products</CardTitle>
            </div>
            <CardDescription>Products with the lowest profit margins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Product</th>
                    <th className="text-right py-2 px-4">Revenue</th>
                    <th className="text-right py-2 px-4">Margin</th>
                    <th className="text-right py-2 px-4">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {bottomPerformers.map((product, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-4 font-medium">{product.name}</td>
                      <td className="text-right py-2 px-4">${product.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="text-right py-2 px-4 font-semibold text-orange-600">{product.margin.toFixed(2)}%</td>
                      <td className="text-right py-2 px-4">{product.quantity}</td>
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
