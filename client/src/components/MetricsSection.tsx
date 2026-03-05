/**
 * MetricsSection Component
 * Design: Data-First Dark Analytics Hub
 * - Grid of KPI metric cards with trend indicators
 * - Sparkline charts per metric
 * - IBM Plex Mono for numbers
 */

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip
} from "recharts";

const generateSparkData = (base: number, trend: "up" | "down" | "flat", points = 12) => {
  return Array.from({ length: points }, (_, i) => {
    const noise = (Math.random() - 0.5) * base * 0.15;
    const trendFactor = trend === "up" ? i * base * 0.02 : trend === "down" ? -i * base * 0.015 : 0;
    return { v: Math.max(0, base + noise + trendFactor) };
  });
};

const kpiMetrics = [
  {
    label: "Total Revenue",
    value: "$2.4M",
    change: "+24.5%",
    trend: "up" as const,
    period: "vs last month",
    color: "#2563EB",
    bgColor: "bg-blue-500/10",
    data: generateSparkData(200000, "up"),
  },
  {
    label: "Gross Profit Margin",
    value: "38.2%",
    change: "+2.1pp",
    trend: "up" as const,
    period: "vs last month",
    color: "#10B981",
    bgColor: "bg-emerald-500/10",
    data: generateSparkData(35, "up"),
  },
  {
    label: "Average Order Value",
    value: "$127",
    change: "+$8.40",
    trend: "up" as const,
    period: "vs last month",
    color: "#8B5CF6",
    bgColor: "bg-violet-500/10",
    data: generateSparkData(120, "up"),
  },
  {
    label: "Cart Abandonment Rate",
    value: "68.3%",
    change: "-3.2pp",
    trend: "up" as const,
    period: "improvement",
    color: "#F59E0B",
    bgColor: "bg-amber-500/10",
    data: generateSparkData(72, "down"),
  },
  {
    label: "Customer Acquisition Cost",
    value: "$18.40",
    change: "-$2.10",
    trend: "up" as const,
    period: "improvement",
    color: "#06B6D4",
    bgColor: "bg-cyan-500/10",
    data: generateSparkData(20, "down"),
  },
  {
    label: "Return on Ad Spend",
    value: "4.2x",
    change: "+0.6x",
    trend: "up" as const,
    period: "vs last month",
    color: "#10B981",
    bgColor: "bg-emerald-500/10",
    data: generateSparkData(3.6, "up"),
  },
  {
    label: "Refund Rate",
    value: "2.8%",
    change: "+0.4pp",
    trend: "down" as const,
    period: "needs attention",
    color: "#EF4444",
    bgColor: "bg-red-500/10",
    data: generateSparkData(2.4, "up"),
  },
  {
    label: "Repeat Purchase Rate",
    value: "34.7%",
    change: "+1.8pp",
    trend: "up" as const,
    period: "vs last month",
    color: "#2563EB",
    bgColor: "bg-blue-500/10",
    data: generateSparkData(32, "up"),
  },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
}

export default function MetricsSection() {
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
    <section id="metrics" className="py-24 bg-[oklch(0.1_0.02_255)]" ref={ref}>
      <div className="container">
        {/* Section header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-12 bg-blue-600/50" />
            <span className="text-blue-400 text-xs font-medium uppercase tracking-widest">KPI Metrics</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                20+ Ecommerce KPIs<br />
                <span className="gradient-text">Tracked Automatically</span>
              </h2>
              <p className="text-slate-400 max-w-xl">
                Every metric your team needs — from revenue and margin to customer behavior 
                and marketing efficiency — surfaced in a single Power BI workspace.
              </p>
            </div>
            <button
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              onClick={() => document.querySelector("#get-started")?.scrollIntoView({ behavior: "smooth" })}
            >
              View all metrics
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics.map((metric, i) => (
            <div
              key={metric.label}
              className="glow-card rounded-xl p-5 space-y-4 group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <span className="text-slate-500 text-xs leading-snug">{metric.label}</span>
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    metric.trend === "up"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-red-400 bg-red-500/10"
                  }`}
                >
                  <TrendIcon trend={metric.trend} />
                  {metric.change}
                </div>
              </div>

              {/* Value */}
              <div>
                <div className="metric-value text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-xs text-slate-600 mt-0.5">{metric.period}</div>
              </div>

              {/* Sparkline */}
              {visible && (
                <div className="h-12 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.data}>
                      <defs>
                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke={metric.color}
                        strokeWidth={1.5}
                        fill={`url(#grad-${i})`}
                        dot={false}
                        animationDuration={1000}
                      />
                      <Tooltip
                        contentStyle={{ display: "none" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-sm">
            All metrics auto-refresh from your connected data sources — Shopify, WooCommerce, Amazon, and more.
          </p>
        </div>
      </div>
    </section>
  );
}
