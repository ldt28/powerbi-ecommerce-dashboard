import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, Package, AlertCircle } from "lucide-react";

export interface ProductDetailData {
  id: string;
  name: string;
  category: string;
  revenue: number;
  profit: number;
  margin: number;
  quantity: number;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  unitCost: number;
  monthlyTrend?: Array<{ month: string; revenue: number; profit: number }>;
  regionBreakdown?: Array<{ region: string; revenue: number; percentage: number }>;
  customerMetrics?: {
    totalCustomers: number;
    repeatCustomers: number;
    avgOrderValue: number;
    returnRate: number;
  };
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetailData | null;
}

const REGION_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!product) return null;

  const isLowStock = product.stock < product.reorderLevel;
  const profitMarginTrend = product.monthlyTrend?.map(m => ({
    month: m.month,
    margin: m.profit > 0 ? ((m.profit / m.revenue) * 100).toFixed(2) : 0,
  })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <p className="text-sm text-gray-500 mt-2">
                <Badge variant="outline" className="mr-2">
                  {product.category}
                </Badge>
                <Badge variant={isLowStock ? "destructive" : "secondary"}>
                  {isLowStock ? "Low Stock" : "In Stock"}
                </Badge>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(product.revenue / 1000).toFixed(1)}K</div>
                <p className="text-xs text-gray-500 mt-1">Lifetime revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${(product.profit / 1000).toFixed(1)}K</div>
                <p className="text-xs text-gray-500 mt-1">Net profit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{product.margin.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 mt-1">Profit margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Stock Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                  {product.stock}
                </div>
                <p className="text-xs text-gray-500 mt-1">Reorder at {product.reorderLevel}</p>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Unit Price</p>
                  <p className="text-2xl font-bold">${product.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unit Cost</p>
                  <p className="text-2xl font-bold">${product.unitCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Per-Unit Profit</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(product.unitPrice - product.unitCost).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          {product.monthlyTrend && product.monthlyTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Performance Trend</CardTitle>
                <CardDescription>Revenue and profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={product.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value: any) => typeof value === 'number' ? `$${value.toFixed(2)}` : value} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                    <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Region Breakdown */}
          {product.regionBreakdown && product.regionBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Region</CardTitle>
                <CardDescription>Geographic distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={product.regionBreakdown}
                        dataKey="revenue"
                        nameKey="region"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {product.regionBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {product.regionBreakdown.map((region, index) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: REGION_COLORS[index % REGION_COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{region.region}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">${(region.revenue / 1000).toFixed(1)}K</p>
                          <p className="text-xs text-gray-500">{region.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Metrics */}
          {product.customerMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold">{product.customerMetrics.totalCustomers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Repeat Customers</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {product.customerMetrics.repeatCustomers}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold">${product.customerMetrics.avgOrderValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Return Rate</p>
                    <p className={`text-2xl font-bold ${product.customerMetrics.returnRate > 5 ? "text-red-600" : "text-green-600"}`}>
                      {product.customerMetrics.returnRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory Alert */}
          {isLowStock && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-700">
                Current stock ({product.stock}) is below reorder level ({product.reorderLevel}). Consider placing a new order.
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
