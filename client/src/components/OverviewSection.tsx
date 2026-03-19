/**
 * OverviewSection Component
 * Design: Data-First Dark Analytics Hub
 * - Live-looking charts using Recharts
 * - Revenue trend line chart + category donut
 * - Animated on scroll
 */

import { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { TrendingUp, Package, RefreshCw } from "lucide-react";

const revenueData = [
  { month: "Jan", revenue: 142000, orders: 1120 },
  { month: "Feb", revenue: 158000, orders: 1240 },
  { month: "Mar", revenue: 171000, orders: 1380 },
  { month: "Apr", revenue: 165000, orders: 1290 },
  { month: "May", revenue: 189000, orders: 1520 },
  { month: "Jun", revenue: 204000, orders: 1680 },
  { month: "Jul", revenue: 218000, orders: 1750 },
  { month: "Aug", revenue: 231000, orders: 1820 },
  { month: "Sep", revenue: 245000, orders: 1940 },
  { month: "Oct", revenue: 268000, orders: 2100 },
  { month: "Nov", revenue: 312000, orders: 2480 },
  { month: "Dec", revenue: 297000, orders: 2340 },
];

const categoryData = [
  { name: "Electronics", value: 35, color: "#2563EB" },
  { name: "Clothing", value: 28, color: "#10B981" },
  { name: "Home & Garden", value: 22, color: "#F59E0B" },
  { name: "Sports", value: 9, color: "#8B5CF6" },
  { name: "Other", value: 6, color: "#64748B" },
];

const channelData = [
  { channel: "Direct", revenue: 820000, orders: 6400 },
  { channel: "Organic", revenue: 640000, orders: 5100 },
  { channel: "Paid Ads", revenue: 510000, orders: 3900 },
  { channel: "Email", revenue: 280000, orders: 2200 },
  { channel: "Social", revenue: 150000, orders: 830 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[oklch(0.15_0.025_255)] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name === "revenue" ? `$${(p.value / 1000).toFixed(0)}K` : p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OverviewSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="overview" className="py-24 bg-[oklch(0.1_0.02_255)]" ref={ref}>
      <div className="container">
        {/* Section header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-12 bg-blue-600/50" />
            <span className="text-blue-400 text-xs font-medium uppercase tracking-widest">Live Analytics Overview</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                Your Ecommerce Performance,<br />
                <span className="gradient-text">At a Glance</span>
              </h2>
              <p className="text-slate-400 max-w-xl">
                Analytics dashboards that surface the metrics your team needs — from revenue trends 
                to channel attribution, updated in real time.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />
              <span>Last updated: just now</span>
            </div>
          </div>
        </div>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue trend — spans 2 cols */}
          <div className="lg:col-span-2 glow-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold text-sm">Monthly Revenue Trend</h3>
                <p className="text-slate-500 text-xs mt-0.5">Jan – Dec 2024</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold metric-value">
                <TrendingUp className="w-4 h-4" />
                +24.5%
              </div>
            </div>
            {visible && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ fill: "#2563EB", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#60A5FA" }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category donut */}
          <div className="glow-card rounded-2xl p-6">
            <div className="mb-6">
              <h3 className="text-white font-semibold text-sm">Sales by Category</h3>
              <p className="text-slate-500 text-xs mt-0.5">Revenue distribution</p>
            </div>
            {visible && (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={1200}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} contentStyle={{ background: "oklch(0.15 0.025 255)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: "8px", color: "#fff" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2 mt-2">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                        <span className="text-slate-400">{cat.name}</span>
                      </div>
                      <span className="metric-value text-white font-medium">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Channel performance bar chart — full width */}
          <div className="lg:col-span-3 glow-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold text-sm">Revenue by Acquisition Channel</h3>
                <p className="text-slate-500 text-xs mt-0.5">Annual performance breakdown</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Package className="w-3.5 h-3.5" />
                <span>5 channels tracked</span>
              </div>
            </div>
            {visible && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channelData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" vertical={false} />
                  <XAxis dataKey="channel" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#64748B", fontSize: "11px" }} />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} animationDuration={1200} />
                  <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} animationDuration={1400} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
