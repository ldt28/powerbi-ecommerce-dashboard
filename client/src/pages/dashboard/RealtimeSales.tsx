import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/DateRangeFilter";
import { ExportButtons } from "@/components/ExportButtons";
import { MapView } from "@/components/Map";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { DollarSign, TrendingUp, Zap, MapPin, Activity } from "lucide-react";

interface DateRange {
  from: Date;
  to: Date;
}

interface SalesTransaction {
  id: string;
  timestamp: Date;
  amount: number;
  location: string;
  product: string;
  channel: string;
  latitude: number;
  longitude: number;
}

interface GeographicalData {
  region: string;
  sales: number;
  orders: number;
  latitude: number;
  longitude: number;
}

export default function RealtimeSales() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const [liveMetrics, setLiveMetrics] = useState({
    totalSales: 2450000,
    ordersToday: 1247,
    avgOrderValue: 196.5,
    conversionRate: 4.2,
    lastUpdate: new Date()
  });

  const [recentTransactions, setRecentTransactions] = useState<SalesTransaction[]>([
    {
      id: "TXN-001",
      timestamp: new Date(),
      amount: 245.99,
      location: "New York, NY",
      product: "Premium Widget",
      channel: "Amazon",
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      id: "TXN-002",
      timestamp: new Date(Date.now() - 60000),
      amount: 189.50,
      location: "Los Angeles, CA",
      product: "Standard Kit",
      channel: "eBay",
      latitude: 34.0522,
      longitude: -118.2437
    },
    {
      id: "TXN-003",
      timestamp: new Date(Date.now() - 120000),
      amount: 312.75,
      location: "Chicago, IL",
      product: "Deluxe Bundle",
      channel: "Walmart",
      latitude: 41.8781,
      longitude: -87.6298
    },
    {
      id: "TXN-004",
      timestamp: new Date(Date.now() - 180000),
      amount: 156.25,
      location: "Houston, TX",
      product: "Basic Pack",
      channel: "WebStores",
      latitude: 29.7604,
      longitude: -95.3698
    },
    {
      id: "TXN-005",
      timestamp: new Date(Date.now() - 240000),
      amount: 428.00,
      location: "Phoenix, AZ",
      product: "Professional Suite",
      channel: "Tractor Supply",
      latitude: 33.4484,
      longitude: -112.0742
    }
  ]);

  const [salesTrend, setSalesTrend] = useState([
    { time: "12:00 AM", sales: 45000, orders: 120 },
    { time: "1:00 AM", sales: 52000, orders: 145 },
    { time: "2:00 AM", sales: 48000, orders: 135 },
    { time: "3:00 AM", sales: 61000, orders: 165 },
    { time: "4:00 AM", sales: 55000, orders: 150 },
    { time: "5:00 AM", sales: 67000, orders: 180 },
    { time: "6:00 AM", sales: 72000, orders: 195 },
    { time: "7:00 AM", sales: 85000, orders: 225 },
    { time: "8:00 AM", sales: 92000, orders: 245 },
    { time: "9:00 AM", sales: 105000, orders: 280 },
    { time: "10:00 AM", sales: 118000, orders: 315 }
  ]);

  const [geographicalData, setGeographicalData] = useState<GeographicalData[]>([
    { region: "Northeast", sales: 450000, orders: 1200, latitude: 40.7128, longitude: -74.0060 },
    { region: "Southeast", sales: 380000, orders: 950, latitude: 33.7490, longitude: -84.3880 },
    { region: "Midwest", sales: 420000, orders: 1100, latitude: 41.8781, longitude: -87.6298 },
    { region: "Southwest", sales: 350000, orders: 850, latitude: 33.4484, longitude: -112.0742 },
    { region: "West Coast", sales: 520000, orders: 1350, latitude: 34.0522, longitude: -118.2437 }
  ]);

  const [channelPerformance, setChannelPerformance] = useState([
    { channel: "Amazon", sales: 450000, orders: 1200 },
    { channel: "eBay", sales: 320000, orders: 850 },
    { channel: "Walmart", sales: 380000, orders: 950 },
    { channel: "WebStores", sales: 280000, orders: 720 },
    { channel: "Tractor Supply", sales: 240000, orders: 620 },
    { channel: "AutoZone", sales: 200000, orders: 520 },
    { channel: "Northern Tool", sales: 180000, orders: 480 },
    { channel: "Lowe's", sales: 200000, orders: 520 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalSales: prev.totalSales + Math.floor(Math.random() * 5000),
        ordersToday: prev.ordersToday + Math.floor(Math.random() * 10),
        avgOrderValue: prev.avgOrderValue + (Math.random() - 0.5) * 5,
        conversionRate: prev.conversionRate + (Math.random() - 0.5) * 0.1,
        lastUpdate: new Date()
      }));

      // Add new transaction
      const newTransaction: SalesTransaction = {
        id: `TXN-${Date.now()}`,
        timestamp: new Date(),
        amount: Math.floor(Math.random() * 400) + 50,
        location: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ"][Math.floor(Math.random() * 5)],
        product: ["Premium Widget", "Standard Kit", "Deluxe Bundle", "Basic Pack", "Professional Suite"][Math.floor(Math.random() * 5)],
        channel: ["Amazon", "eBay", "Walmart", "WebStores", "Tractor Supply"][Math.floor(Math.random() * 5)],
        latitude: 40.7128 + (Math.random() - 0.5) * 20,
        longitude: -74.0060 + (Math.random() - 0.5) * 30
      };

      setRecentTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    return {
      transactions: recentTransactions,
      geographical: geographicalData,
      channels: channelPerformance,
      trends: salesTrend
    };
  }, [dateRange, recentTransactions, geographicalData, channelPerformance, salesTrend]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Sales Tracking</h1>
          <p className="text-gray-400 mt-1">Live sales monitoring and geographical distribution</p>
        </div>
        <div className="flex gap-4">
          <DateRangeFilter
            onDateRangeChange={setDateRange}
          />
          <ExportButtons
            data={{
              kpis: {
                "Total Sales": `$${liveMetrics.totalSales.toLocaleString()}`,
                "Orders": liveMetrics.ordersToday,
                "AOV": `$${liveMetrics.avgOrderValue.toFixed(2)}`,
                "Conversion Rate": `${liveMetrics.conversionRate.toFixed(2)}%`
              }
            }}
            title="Real-Time Sales"
            dateRange={dateRange}
          />
        </div>
      </div>

      {/* Live KPI Cards with Pulse Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 border-blue-900/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Sales (Today)</p>
                  <p className="text-3xl font-bold">${(liveMetrics.totalSales / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-green-400 mt-2">+12.5% vs last period</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <Card className="bg-gradient-to-br from-orange-900/20 to-orange-900/10 border-orange-900/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Orders Today</p>
                  <p className="text-3xl font-bold">{liveMetrics.ordersToday.toLocaleString()}</p>
                  <p className="text-sm text-green-400 mt-2">+8.3% vs last period</p>
                </div>
                <Activity className="w-12 h-12 text-orange-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 border-purple-900/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Average Order Value</p>
                  <p className="text-3xl font-bold">${liveMetrics.avgOrderValue.toFixed(2)}</p>
                  <p className="text-sm text-red-400 mt-2">-2.1% vs last period</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/10 border-pink-900/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Conversion Rate</p>
                  <p className="text-3xl font-bold">{liveMetrics.conversionRate.toFixed(2)}%</p>
                  <p className="text-sm text-green-400 mt-2">+5.7% vs last period</p>
                </div>
                <Zap className="w-12 h-12 text-pink-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-Time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 12 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredData.trends}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Trend (Last 12 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(value) => value.toLocaleString()}
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData.channels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="channel" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData.geographical}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                />
                <Bar dataKey="sales" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographical Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geographical Sales Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border border-gray-700">
            <MapView />
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-green-500" />
            Recent Transactions (Live)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-400">{transaction.id}</span>
                    <span className="text-xs text-gray-500">
                      {transaction.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {transaction.product} • {transaction.location}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Channel: {transaction.channel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold">Region</th>
                  <th className="text-right py-3 px-4 font-semibold">Sales</th>
                  <th className="text-right py-3 px-4 font-semibold">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold">Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.geographical.map((region, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-3 px-4">{region.region}</td>
                    <td className="text-right py-3 px-4 text-green-400">
                      ${region.sales.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      {region.orders.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${(region.sales / region.orders).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Last Update Info */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {liveMetrics.lastUpdate.toLocaleTimeString()}
        <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      </div>
    </div>
  );
}
