import { useState } from "react";
import { Search, ChevronRight, BookOpen, Code, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const categories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      { title: "Setup & Installation", slug: "setup-installation" },
      { title: "Creating Your First Dashboard", slug: "first-dashboard" },
      { title: "Connecting Data Sources", slug: "connecting-data" },
      { title: "Understanding KPIs", slug: "understanding-kpis" },
    ],
  },
  {
    id: "api-docs",
    title: "API Documentation",
    icon: Code,
    articles: [
      { title: "Authentication & API Keys", slug: "authentication" },
      { title: "API Endpoints Reference", slug: "endpoints" },
      { title: "SellerCloud Integration", slug: "sellercloud" },
      { title: "eBay API Setup", slug: "ebay-api" },
      { title: "Amazon API Setup", slug: "amazon-api" },
      { title: "BigCommerce Integration", slug: "bigcommerce" },
      { title: "Walmart API Setup", slug: "walmart-api" },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: AlertCircle,
    articles: [
      { title: "Common Issues & Solutions", slug: "common-issues" },
      { title: "Data Sync Problems", slug: "data-sync" },
      { title: "Dashboard Errors", slug: "dashboard-errors" },
      { title: "Performance Optimization", slug: "performance" },
      { title: "FAQ", slug: "faq" },
    ],
  },
];

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("getting-started");

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    articles: cat.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  const selectedCat = filteredCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_255)]">
      {/* Header */}
      <div className="pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Documentation & Help
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Everything you need to get started and master Ecommerce Analytics
        </p>
      </div>

      {/* Search */}
      <div className="container mb-12">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-3 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Categories */}
          <div className="lg:col-span-1">
            <div className="space-y-2 sticky top-20">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                      selectedCategory === cat.id
                        ? "bg-blue-600/20 border border-blue-500/50 text-blue-400"
                        : "text-slate-400 hover:text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles */}
          <div className="lg:col-span-3">
            {selectedCat && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-6">{selectedCat.title}</h2>

                {selectedCat.articles.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCat.articles.map((article) => (
                      <a
                        key={article.slug}
                        href={`/docs/${article.slug}`}
                        className="block p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No articles found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white/5 border-t border-white/10 py-12">
        <div className="container">
          <h3 className="text-xl font-bold text-white mb-8 text-center">Need More Help?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { title: "Contact Support", desc: "Reach out to our support team" },
              { title: "Video Tutorials", desc: "Learn with step-by-step videos" },
              { title: "Community Forum", desc: "Connect with other users" },
            ].map((item, i) => (
              <a
                key={i}
                href="#"
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 text-center transition-all"
              >
                <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
