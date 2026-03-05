/**
 * DashboardsSection Component
 * Design: Data-First Dark Analytics Hub
 * - Tabbed dashboard categories
 * - Card grid with dashboard previews
 * - Animated transitions
 */

import { useState } from "react";
import {
  BarChart2, ShoppingBag, Users, Package, Globe, CreditCard,
  ArrowRight, ExternalLink, Star
} from "lucide-react";

const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407165030/WvPYJ7NAAU3fx6gobKH9kA/dashboard-preview-6kcrLH35eaDDXeZgCLRogJ.webp";
const METRICS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407165030/WvPYJ7NAAU3fx6gobKH9kA/metrics-visual-QmBwQnLU332q4qEd77mzZA.webp";

const categories = [
  { id: "sales", label: "Sales", icon: BarChart2 },
  { id: "customers", label: "Customers", icon: Users },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "marketing", label: "Marketing", icon: Globe },
  { id: "payments", label: "Payments", icon: CreditCard },
];

const dashboards: Record<string, Array<{
  title: string;
  description: string;
  metrics: string[];
  badge?: string;
  img: string;
}>> = {
  sales: [
    {
      title: "Sales Performance Overview",
      description: "Track total revenue, order volume, AOV, and daily sales trends with drill-down by product, region, and time period.",
      metrics: ["Total Revenue", "Orders", "AOV", "Gross Margin"],
      badge: "Most Popular",
      img: DASHBOARD_IMG,
    },
    {
      title: "Product Revenue Analysis",
      description: "Identify top-performing SKUs, analyze product-level profitability, and spot underperforming items before they impact margin.",
      metrics: ["Revenue per SKU", "Units Sold", "Return Rate", "Profit Margin"],
      img: METRICS_IMG,
    },
    {
      title: "Monthly Sales Scorecard",
      description: "Executive-ready monthly summary with MoM and YoY comparisons, target vs. actual tracking, and trend indicators.",
      metrics: ["MoM Growth", "YoY Comparison", "Target vs Actual", "Forecast"],
      badge: "New",
      img: DASHBOARD_IMG,
    },
  ],
  customers: [
    {
      title: "Customer Lifetime Value",
      description: "Segment customers by LTV, identify high-value cohorts, and track repeat purchase behavior over time.",
      metrics: ["LTV", "Repeat Rate", "Churn Rate", "Cohort Analysis"],
      badge: "Most Popular",
      img: METRICS_IMG,
    },
    {
      title: "Customer Acquisition Dashboard",
      description: "Measure CAC by channel, track new vs. returning customer ratios, and optimize acquisition spend.",
      metrics: ["CAC", "New Customers", "Returning Rate", "Channel Mix"],
      img: DASHBOARD_IMG,
    },
    {
      title: "Behavior & Engagement",
      description: "Analyze session data, cart abandonment, wishlist activity, and purchase funnel drop-off points.",
      metrics: ["Session Duration", "Cart Abandonment", "Funnel Conversion", "Page Views"],
      img: METRICS_IMG,
    },
  ],
  inventory: [
    {
      title: "Stock Level Monitor",
      description: "Real-time inventory levels across all SKUs and warehouses, with low-stock alerts and reorder point tracking.",
      metrics: ["Stock Levels", "Low Stock Alerts", "Reorder Points", "Days of Supply"],
      badge: "Critical",
      img: DASHBOARD_IMG,
    },
    {
      title: "Inventory Turnover Report",
      description: "Track how quickly inventory sells, identify slow-moving stock, and optimize working capital allocation.",
      metrics: ["Turnover Rate", "Slow Movers", "Dead Stock", "GMROI"],
      img: METRICS_IMG,
    },
  ],
  marketing: [
    {
      title: "Campaign ROI Tracker",
      description: "Measure the return on every marketing dollar — by campaign, channel, and audience segment.",
      metrics: ["ROAS", "CPC", "CTR", "Revenue Attributed"],
      badge: "Most Popular",
      img: METRICS_IMG,
    },
    {
      title: "Channel Attribution Model",
      description: "Understand which channels drive first-touch and last-touch conversions with multi-touch attribution.",
      metrics: ["First Touch", "Last Touch", "Linear Attribution", "Time Decay"],
      img: DASHBOARD_IMG,
    },
  ],
  payments: [
    {
      title: "Payment Method Analytics",
      description: "Analyze checkout conversion by payment method, track decline rates, and identify friction points.",
      metrics: ["Approval Rate", "Decline Rate", "Method Mix", "Checkout Conversion"],
      img: DASHBOARD_IMG,
    },
    {
      title: "Refunds & Chargebacks",
      description: "Monitor refund rates by product and category, track chargeback trends, and protect revenue.",
      metrics: ["Refund Rate", "Chargeback Rate", "Dispute Resolution", "Net Revenue"],
      badge: "Risk",
      img: METRICS_IMG,
    },
  ],
};

const badgeColors: Record<string, string> = {
  "Most Popular": "bg-blue-500/15 text-blue-400 border-blue-500/25",
  "New": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  "Critical": "bg-red-500/15 text-red-400 border-red-500/25",
  "Risk": "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export default function DashboardsSection() {
  const [activeCategory, setActiveCategory] = useState("sales");

  const activeDashboards = dashboards[activeCategory] || [];

  return (
    <section id="dashboards" className="py-24 bg-[oklch(0.11_0.02_255)]">
      <div className="container">
        {/* Section header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 max-w-12 bg-blue-600/50" />
            <span className="text-blue-400 text-xs font-medium uppercase tracking-widest">Dashboard Library</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                Pre-Built Dashboards for<br />
                <span className="gradient-text">Every Ecommerce Team</span>
              </h2>
              <p className="text-slate-400 max-w-xl">
                From sales ops to marketing analytics, each dashboard is purpose-built for 
                your team's specific workflows and decision-making needs.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span>{Object.values(dashboards).flat().length} dashboards available</span>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/8 border border-white/8"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDashboards.map((dashboard, i) => (
            <div
              key={dashboard.title}
              className="glow-card rounded-2xl overflow-hidden group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Preview image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dashboard.img}
                  alt={dashboard.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.13_0.025_255)] via-transparent to-transparent" />
                {dashboard.badge && (
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColors[dashboard.badge]}`}>
                    {dashboard.badge}
                  </div>
                )}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white text-xs">Preview</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-sm leading-snug mb-2">{dashboard.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{dashboard.description}</p>
                </div>

                {/* Metrics pills */}
                <div className="flex flex-wrap gap-1.5">
                  {dashboard.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-2.5 py-1 bg-white/5 border border-white/8 rounded-full text-xs text-slate-400"
                    >
                      {metric}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                    ))}
                  </div>
                  <button className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                    Use Template
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
