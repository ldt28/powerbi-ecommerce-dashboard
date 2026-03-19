/**
 * FeaturesSection Component
 * Design: Data-First Dark Analytics Hub
 * - Asymmetric grid layout
 * - Feature cards with icons and descriptions
 * - Integrations logos row
 */

import { useEffect, useRef, useState } from "react";
import {
  Zap, RefreshCw, Filter, Share2, Shield, Smartphone,
  Database, Bell, Download, GitBranch
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Data Refresh",
    description: "Dashboards update automatically as new orders, sessions, and transactions flow in — no manual refreshes needed.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Filter,
    title: "Advanced Filtering & Slicers",
    description: "Drill down by date range, product category, region, channel, or customer segment with interactive filters.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Share2,
    title: "Team Collaboration",
    description: "Share dashboards with your entire ecommerce team. Set role-based access for ops, marketing, and finance.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified when revenue drops, stock hits critical levels, or conversion rates fall below your defined thresholds.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Smartphone,
    title: "Mobile-Ready",
    description: "Access your dashboards on any device. Mobile app ensures your team stays informed on the go.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Download,
    title: "Export & Reporting",
    description: "Export to PDF, Excel, or PowerPoint. Schedule automated email reports to stakeholders weekly or monthly.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Database,
    title: "Multi-Source Data",
    description: "Connect Shopify, WooCommerce, Amazon, Google Analytics, Meta Ads, and 100+ other sources in one workspace.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: GitBranch,
    title: "Custom DAX Measures",
    description: "Pre-built DAX formulas for complex ecommerce calculations — LTV, cohort retention, attribution, and more.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Row-Level Security",
    description: "Restrict data visibility by region, brand, or team. Each stakeholder sees only what's relevant to them.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: RefreshCw,
    title: "Incremental Refresh",
    description: "Handle millions of rows efficiently with incremental refresh — no more slow-loading reports.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

const integrations = [
  { name: "Shopify", color: "#96BF48" },
  { name: "WooCommerce", color: "#7F54B3" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Google Analytics", color: "#E37400" },
  { name: "Meta Ads", color: "#1877F2" },
  { name: "Klaviyo", color: "#FFD700" },
  { name: "Stripe", color: "#635BFF" },
  { name: "BigQuery", color: "#4285F4" },
];

export default function FeaturesSection() {
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
    <section id="features" className="py-24 bg-[oklch(0.11_0.02_255)]" ref={ref}>
      <div className="container">
        {/* Section header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-12 bg-blue-600/50" />
            <span className="text-blue-400 text-xs font-medium uppercase tracking-widest">Platform Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Everything Your Team Needs<br />
            <span className="gradient-text">Built Into Our Platform</span>
          </h2>
          <p className="text-slate-400 max-w-xl">
            Leverage the full power of our analytics platform — purpose-configured for ecommerce 
            data workflows, team collaboration, and executive reporting.
          </p>
        </div>

        {/* Features grid — asymmetric */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`glow-card rounded-xl p-5 space-y-3 ${
                  i === 0 ? "xl:col-span-2 xl:row-span-2" : ""
                }`}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 0.5s ease ${i * 50}ms, transform 0.5s ease ${i * 50}ms`,
                }}
              >
                <div className={`w-9 h-9 rounded-lg ${feature.bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">{feature.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Integrations */}
        <div className="border border-white/8 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-white font-semibold text-lg mb-2">Connects to Your Entire Stack</h3>
            <p className="text-slate-500 text-sm">
              Native connectors for the tools your ecommerce team already uses
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border border-white/8 rounded-lg hover:border-white/15 transition-colors"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: integration.color }}
                />
                <span className="text-slate-300 text-sm font-medium">{integration.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 border border-white/8 rounded-lg">
              <span className="text-slate-500 text-sm">+ 100 more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
