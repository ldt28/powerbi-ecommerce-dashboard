import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$8.88",
    period: "/month",
    description: "Perfect for small ecommerce teams",
    features: [
      { name: "Up to 3 users", included: true },
      { name: "1 marketplace connection", included: true },
      { name: "Revenue & Marketing dashboards", included: true },
      { name: "Daily data sync", included: true },
      { name: "Email support", included: true },
      { name: "Custom alerts", included: false },
      { name: "API access", included: false },
      { name: "Advanced analytics", included: false },
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$28",
    period: "/month",
    description: "For growing ecommerce businesses",
    features: [
      { name: "Up to 10 users", included: true },
      { name: "Unlimited marketplace connections", included: true },
      { name: "All dashboards", included: true },
      { name: "Hourly data sync", included: true },
      { name: "Priority support", included: true },
      { name: "Custom alerts", included: true },
      { name: "API access", included: true },
      { name: "Advanced analytics", included: true },
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Lifetime Founders",
    price: "$200",
    period: "one-time",
    description: "Special offer for early adopters",
    features: [
      { name: "Unlimited users", included: true },
      { name: "Unlimited marketplace connections", included: true },
      { name: "All dashboards & features", included: true },
      { name: "Real-time data sync", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Custom alerts & notifications", included: true },
      { name: "Full API access", included: true },
      { name: "Advanced analytics & forecasting", included: true },
    ],
    cta: "Claim Lifetime Access",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_255)]">
      {/* Header */}
      <div className="pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Choose the plan that fits your business. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105"
                  : "bg-white/5 border border-white/10 hover:border-white/20"
              }`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm ml-2">{plan.period}</span>
              </div>

              <Button
                className={`w-full mb-8 font-semibold ${
                  plan.highlighted
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                }`}
              >
                {plan.cta}
              </Button>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-slate-300" : "text-slate-500 line-through"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white/5 border-t border-white/10 py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes, upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "Is there a free trial?",
                a: "Growth plan includes a 14-day free trial. No credit card required.",
              },
              {
                q: "What happens if I cancel?",
                a: "Your data remains accessible for 30 days. You can reactivate anytime.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes, annual plans get 20% off. Contact us for enterprise pricing.",
              },
              {
                q: "Is the Lifetime Founders offer still available?",
                a: "Limited spots available. This is a one-time offer for early adopters.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for enterprise.",
              },
            ].map((faq, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-white font-semibold">{faq.q}</h4>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
