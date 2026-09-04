/**
 * HeroSection Component
 * Design: Data-First Dark Analytics Hub
 * - Full-height hero with dark navy background image
 * - Animated KPI counter cards
 * - Split layout: left text + right dashboard preview
 * - Electric blue accents, IBM Plex Mono for numbers
 */

import { useEffect, useRef, useState } from "react";
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowRight, Play, CheckCircle2, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const heroStats = [
  { icon: DollarSign, label: "Total Revenue", value: 2400000, prefix: "$", suffix: "", format: (v: number) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v.toLocaleString(), color: "text-emerald-400" },
  { icon: ShoppingCart, label: "Orders Processed", value: 18432, prefix: "", suffix: "", format: (v: number) => v.toLocaleString(), color: "text-blue-400" },
  { icon: TrendingUp, label: "Conversion Rate", value: 38, prefix: "", suffix: "%", format: (v: number) => `${(v/10).toFixed(1)}`, color: "text-amber-400" },
  { icon: Users, label: "Active Customers", value: 94200, prefix: "", suffix: "", format: (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toLocaleString(), color: "text-violet-400" },
];

export default function HeroSection() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const counts = [
    useCountUp(heroStats[0].value, 2000, started),
    useCountUp(heroStats[1].value, 2000, started),
    useCountUp(heroStats[2].value, 2000, started),
    useCountUp(heroStats[3].value, 2000, started),
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#070b14]">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Grid line background overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px"
        }}
      />

      <div className="relative z-10 container pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-medium tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Multi-Marketplace Ecommerce Analytics
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Turn Your Store Data Into{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                  Actionable Insights
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Purpose-built dashboards for ecommerce teams. Track revenue, orders, 
                customer behavior, and multi-channel sync — Amazon, BigCommerce, eBay & Walmart.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30 active:scale-98 cursor-pointer"
              >
                Explore Dashboards
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-medium rounded-xl border border-white/10 transition-all duration-200 cursor-pointer"
              >
                <Play className="w-4 h-4 text-blue-400" />
                Live Demo
              </button>
            </div>

            {/* Stats row */}
            <div ref={ref} className="grid grid-cols-2 gap-4 pt-4">
              {heroStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 space-y-2 backdrop-blur-sm transition-all">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className={`metric-value text-2xl font-bold font-mono ${stat.color}`}>
                      {stat.prefix}{stat.format(counts[i])}{stat.suffix}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Rich Interactive Dashboard Preview */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0d1424]/90 shadow-2xl shadow-black/80 backdrop-blur-xl">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">ecomanalytics.io/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SYNC
                  </span>
                </div>
              </div>

              {/* Mock Dashboard Body */}
              <div className="p-5 space-y-4">
                {/* Marketplace Summary Pills */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "Amazon", rev: "$148.2k", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                    { name: "BigCommerce", rev: "$62.4k", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                    { name: "eBay", rev: "$38.1k", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
                    { name: "Walmart", rev: "$24.8k", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
                  ].map((m) => (
                    <div key={m.name} className={`p-2.5 rounded-lg border ${m.bg} space-y-1`}>
                      <div className="text-[11px] text-slate-400 font-medium truncate">{m.name}</div>
                      <div className={`text-sm font-bold font-mono ${m.color}`}>{m.rev}</div>
                    </div>
                  ))}
                </div>

                {/* Revenue Trend Chart SVG */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">30-Day Revenue Trend</div>
                      <div className="text-xl font-bold text-white font-mono">$273,500 <span className="text-xs text-emerald-400 font-normal">(+18.4%)</span></div>
                    </div>
                    <div className="flex gap-1 text-[11px] text-slate-400 font-mono">
                      <span className="px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-semibold">30D</span>
                      <span className="px-2 py-0.5 rounded hover:bg-slate-800">90D</span>
                      <span className="px-2 py-0.5 rounded hover:bg-slate-800">YTD</span>
                    </div>
                  </div>

                  {/* SVG Chart Line with Gradient Fill */}
                  <div className="h-32 w-full pt-2">
                    <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,80 Q50,40 100,55 T200,30 T300,45 T400,10 L400,100 L0,100 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M0,80 Q50,40 100,55 T200,30 T300,45 T400,10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Interactive Point */}
                      <circle cx="300" cy="45" r="4" fill="#38bdf8" className="animate-ping opacity-75" />
                      <circle cx="300" cy="45" r="4" fill="#38bdf8" />
                      <circle cx="400" cy="10" r="5" fill="#10b981" />
                    </svg>
                  </div>
                </div>

                {/* Recent Orders Feed */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Recent Multi-Channel Orders</span>
                    <span className="flex items-center gap-1 text-slate-500 font-mono"><RefreshCw className="w-3 h-3" /> Auto-sync</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {[
                      { id: "AMZ-94812", item: "Wireless ANC Headphones", price: "$149.99", badge: "Amazon US", status: "Shipped", color: "text-emerald-400" },
                      { id: "BC-29401", item: "Ergonomic Office Chair", price: "$289.00", badge: "BigCommerce", status: "Processing", color: "text-blue-400" },
                      { id: "EBY-48102", item: "Ultra HD Monitor Stand", price: "$59.95", badge: "eBay", status: "Completed", color: "text-emerald-400" },
                    ].map((row) => (
                      <div key={row.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-slate-300 font-semibold">{row.id}</span>
                          <span className="text-slate-400 truncate text-[11px]">{row.item}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">{row.badge}</span>
                          <span className="font-bold text-white">{row.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Metric Badges */}
            <div className="absolute -bottom-4 -left-4 bg-slate-900/90 border border-emerald-500/40 rounded-xl px-4 py-3 backdrop-blur-md shadow-xl shadow-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-emerald-400 font-bold text-sm font-mono">+24.5% MoM</div>
                  <div className="text-slate-400 text-[11px]">Net Margin Growth</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-slate-900/90 border border-blue-500/40 rounded-xl px-4 py-3 backdrop-blur-md shadow-xl shadow-black/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-white font-semibold text-xs">4 Channels Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#070b14] to-transparent pointer-events-none" />
    </section>
  );
}
