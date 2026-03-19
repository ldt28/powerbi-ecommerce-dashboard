/**
 * Footer Component
 * Design: Data-First Dark Analytics Hub
 */

import { BarChart3, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.09_0.02_255)] border-t border-white/8 py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight">Ecommerce</span>
                <span className="text-blue-400 text-sm font-medium"> Analytics</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Purpose-built dashboards for ecommerce teams. Turn your store data 
              into actionable insights.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/15 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Dashboards</h4>
            <ul className="space-y-2.5">
              {["Sales Analytics", "Customer Insights", "Inventory Management", "Marketing ROI", "Payment Analytics"].map((item) => (
                <li key={item}>
                  <a href="#dashboards" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {["About Us", "Case Studies", "Documentation", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#get-started" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="section-divider mb-6" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © 2024 Ecommerce Analytics. Built for ecommerce teams.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
