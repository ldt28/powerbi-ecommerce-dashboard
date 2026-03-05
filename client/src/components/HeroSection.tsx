/**
 * HeroSection Component
 * Design: Data-First Dark Analytics Hub
 * - Full-height hero with dark navy background image
 * - Animated KPI counter cards
 * - Split layout: left text + right dashboard preview
 * - Electric blue accents, IBM Plex Mono for numbers
 */

import { useEffect, useRef, useState } from "react";
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowRight, Play } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407165030/WvPYJ7NAAU3fx6gobKH9kA/hero-bg-WBzP3BokS7tqWhvtiZPzC7.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407165030/WvPYJ7NAAU3fx6gobKH9kA/dashboard-preview-6kcrLH35eaDDXeZgCLRogJ.webp";

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
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.08_0.02_255/0.7)] via-[oklch(0.08_0.02_255/0.5)] to-[oklch(0.1_0.02_255)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.08_0.02_255/0.9)] via-transparent to-[oklch(0.08_0.02_255/0.3)]" />

      <div className="relative z-10 container pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-400 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Power BI · Ecommerce Analytics
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                Turn Your Store Data Into{" "}
                <span className="gradient-text">Actionable Insights</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Purpose-built Power BI dashboards for ecommerce teams. Track revenue, orders, 
                customer behavior, and inventory — all in one unified analytics hub.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.querySelector("#dashboards")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25"
              >
                Explore Dashboards
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.querySelector("#overview")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-6 py-3 bg-white/8 hover:bg-white/12 text-white font-medium rounded-lg border border-white/12 transition-all duration-200"
              >
                <Play className="w-4 h-4 text-blue-400" />
                See How It Works
              </button>
            </div>

            {/* Stats row */}
            <div ref={ref} className="grid grid-cols-2 gap-4 pt-4">
              {heroStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="glow-card rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className={`metric-value text-2xl font-bold ${stat.color}`}>
                      {stat.prefix}{stat.format(counts[i])}{stat.suffix}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Dashboard preview */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <img
                src={DASHBOARD_IMG}
                alt="Power BI Ecommerce Dashboard Preview"
                className="w-full object-cover"
              />
              {/* Overlay glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.1_0.02_255/0.3)] to-transparent pointer-events-none" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm metric-value">+24.5%</span>
                <span className="text-slate-400 text-xs">MoM Revenue</span>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-blue-500/15 border border-blue-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-400 font-medium text-xs">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[oklch(0.1_0.02_255)] to-transparent pointer-events-none" />
    </section>
  );
}
