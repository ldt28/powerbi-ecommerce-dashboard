/**
 * GetStartedSection Component
 * Design: Data-First Dark Analytics Hub
 * - CTA section with contact form
 * - Left: value proposition + checklist
 * - Right: form card
 */

import { useState } from "react";
import { CheckCircle, Send, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const benefits = [
  "Pre-built dashboard templates ready in 24 hours",
  "Custom KPIs configured for your product catalog",
  "Direct connection to your Shopify/WooCommerce store",
  "Team training and onboarding included",
  "Ongoing support and monthly dashboard reviews",
];

const useCases = [
  { label: "Sales Team", desc: "Track daily revenue, orders, and product performance" },
  { label: "Marketing Team", desc: "Monitor ROAS, CAC, and channel attribution" },
  { label: "Operations Team", desc: "Manage inventory, fulfillment, and returns" },
  { label: "Executive Team", desc: "High-level KPI scorecards and trend reports" },
];

export default function GetStartedSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    platform: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    toast.success("Request submitted! We'll be in touch within 24 hours.", {
      description: "Check your inbox for a confirmation email.",
    });
    setFormData({ name: "", email: "", company: "", platform: "", message: "" });
  };

  return (
    <section id="get-started" className="py-24 bg-[oklch(0.1_0.02_255)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Section header */}
        <div className="mb-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-blue-600/50" />
            <span className="text-blue-400 text-xs font-medium uppercase tracking-widest">Get Started</span>
            <div className="h-px w-12 bg-blue-600/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Ready to Transform Your<br />
            <span className="gradient-text">Ecommerce Data?</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Tell us about your store and team. We'll set up your first Power BI dashboard 
            workspace within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Benefits + Use cases */}
          <div className="space-y-10">
            <div>
              <h3 className="text-white font-semibold text-lg mb-5">What's included</h3>
              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-5">Built for every team</h3>
              <div className="grid grid-cols-2 gap-3">
                {useCases.map((uc) => (
                  <div key={uc.label} className="glow-card rounded-xl p-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-white text-sm font-medium">{uc.label}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{uc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="glow-card rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  JM
                </div>
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "The Power BI dashboards transformed how our team makes decisions. 
                    We went from weekly spreadsheet reviews to real-time visibility across all channels."
                  </p>
                  <div className="mt-3">
                    <div className="text-white text-xs font-semibold">James M.</div>
                    <div className="text-slate-500 text-xs">Head of Ecommerce, RetailCo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glow-card rounded-2xl p-8">
            <h3 className="text-white font-semibold text-lg mb-6">Request Your Dashboard Setup</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs mb-1.5">Work Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Company / Store Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
                  placeholder="Your store name"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Ecommerce Platform</label>
                <select
                  required
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors appearance-none"
                >
                  <option value="" className="bg-[oklch(0.13_0.025_255)]">Select platform...</option>
                  <option value="shopify" className="bg-[oklch(0.13_0.025_255)]">Shopify</option>
                  <option value="woocommerce" className="bg-[oklch(0.13_0.025_255)]">WooCommerce</option>
                  <option value="amazon" className="bg-[oklch(0.13_0.025_255)]">Amazon Seller</option>
                  <option value="bigcommerce" className="bg-[oklch(0.13_0.025_255)]">BigCommerce</option>
                  <option value="magento" className="bg-[oklch(0.13_0.025_255)]">Magento</option>
                  <option value="other" className="bg-[oklch(0.13_0.025_255)]">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-xs mb-1.5">What metrics matter most to you?</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors resize-none"
                  placeholder="e.g. Revenue by channel, inventory turnover, customer LTV..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Request Dashboard Setup
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-slate-600 text-xs">
                No commitment required. We'll reach out within 24 hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
