import { useState } from "react";
import { TrendingUp, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const caseStudies = [
  {
    id: 1,
    title: "RetailCo: 45% Revenue Growth",
    industry: "General Retail",
    marketplace: "Amazon",
    logo: "RC",
    challenge: "Struggling to track performance across multiple Amazon accounts",
    solution: "Implemented unified Revenue Overview dashboard with real-time metrics",
    results: [
      { metric: "+45%", label: "Revenue Growth" },
      { metric: "3x", label: "Faster Decision Making" },
      { metric: "15 hrs/week", label: "Time Saved" },
    ],
    quote: "The dashboards transformed how we manage our Amazon business. We went from weekly spreadsheet reviews to real-time visibility.",
    author: "James M., Head of Ecommerce",
  },
  {
    id: 2,
    title: "TechStore: 60% ROAS Improvement",
    industry: "Electronics",
    marketplace: "eBay",
    logo: "TS",
    challenge: "Ad spend was inefficient, no visibility into which channels performed best",
    solution: "Set up Marketing Performance dashboard with ROAS and CPA tracking",
    results: [
      { metric: "+60%", label: "ROAS Improvement" },
      { metric: "-35%", label: "CPA Reduction" },
      { metric: "+120%", label: "Ad Efficiency" },
    ],
    quote: "We cut our ad spend by 35% while increasing revenue. The marketing dashboard showed us exactly where to optimize.",
    author: "Sarah K., Marketing Director",
  },
  {
    id: 3,
    title: "HomeGoods: 2x Inventory Turnover",
    industry: "Home & Garden",
    marketplace: "BigCommerce",
    logo: "HG",
    challenge: "Inventory mismanagement causing stockouts and overstock situations",
    solution: "Deployed Product Analysis dashboard with inventory tracking",
    results: [
      { metric: "2x", label: "Inventory Turnover" },
      { metric: "-40%", label: "Stockouts" },
      { metric: "+25%", label: "Profit Margin" },
    ],
    quote: "Better inventory visibility helped us reduce stockouts by 40% and improve margins significantly.",
    author: "Mike T., Operations Manager",
  },
  {
    id: 4,
    title: "AutoParts Inc: Multi-Channel Sync",
    industry: "Automotive",
    marketplace: "Walmart",
    logo: "AP",
    challenge: "Managing inventory across eBay, Amazon, Walmart, and AutoZone was chaotic",
    solution: "Connected all 4 marketplaces with unified dashboard",
    results: [
      { metric: "4", label: "Marketplaces Unified" },
      { metric: "100%", label: "Inventory Accuracy" },
      { metric: "50%", label: "Sync Time Reduced" },
    ],
    quote: "Finally have a single source of truth for all our marketplace data. Inventory management is now seamless.",
    author: "David R., Supply Chain Lead",
  },
  {
    id: 5,
    title: "GreenGrow: 3x Team Efficiency",
    industry: "Agriculture",
    marketplace: "Tractor Supply",
    logo: "GG",
    challenge: "Team spent 20+ hours weekly on manual reporting",
    solution: "Automated all dashboards with hourly data sync",
    results: [
      { metric: "20 hrs/week", label: "Time Saved" },
      { metric: "3x", label: "Team Efficiency" },
      { metric: "100%", label: "Data Accuracy" },
    ],
    quote: "Automation freed up our team to focus on strategy instead of data entry. Best investment we made.",
    author: "Lisa P., CEO",
  },
];

export default function CaseStudies() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);

  const industries = Array.from(new Set(caseStudies.map((cs) => cs.industry)));
  const marketplaces = Array.from(new Set(caseStudies.map((cs) => cs.marketplace)));

  const filtered = caseStudies.filter((cs) => {
    if (selectedIndustry && cs.industry !== selectedIndustry) return false;
    if (selectedMarketplace && cs.marketplace !== selectedMarketplace) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_255)]">
      {/* Header */}
      <div className="pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Success Stories
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          See how ecommerce teams are using Ecommerce Analytics to grow their business
        </p>
      </div>

      {/* Filters */}
      <div className="container mb-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Industry</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedIndustry(null)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedIndustry === null
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/15"
                }`}
              >
                All
              </button>
              {industries && industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedIndustry === ind
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/15"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Marketplace Filter */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Marketplace</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMarketplace(null)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedMarketplace === null
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-300 hover:bg-white/15"
                }`}
              >
                All
              </button>
              {marketplaces && marketplaces.map((mp) => (
                <button
                  key={mp}
                  onClick={() => setSelectedMarketplace(mp)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedMarketplace === mp
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/15"
                  }`}
                >
                  {mp}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="container pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map((cs) => (
            <div
              key={cs.id}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                    {cs.logo}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {cs.industry}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {cs.marketplace}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{cs.title}</h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Challenge & Solution */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">Challenge</h4>
                    <p className="text-slate-300 text-sm">{cs.challenge}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-1">Solution</h4>
                    <p className="text-slate-300 text-sm">{cs.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-3">
                  {cs.results.map((result, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 text-center"
                    >
                      <div className="text-lg font-bold text-emerald-400">{result.metric}</div>
                      <div className="text-xs text-slate-400 mt-1">{result.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-slate-300 italic text-sm mb-3">"{cs.quote}"</p>
                  <p className="text-xs text-slate-500">{cs.author}</p>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-500">
                  Read Full Case Study
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No case studies match your filters.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border-t border-white/10 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to write your success story?</h2>
          <p className="text-slate-400 mb-8">Join hundreds of ecommerce teams growing with Ecommerce Analytics</p>
          <Button className="bg-blue-600 hover:bg-blue-500 px-8">Get Started Today</Button>
        </div>
      </div>
    </div>
  );
}
