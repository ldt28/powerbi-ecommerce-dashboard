import { useState } from "react";
import { Calendar, User, ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "5 KPIs Every Ecommerce Team Should Track",
    category: "Tips",
    author: "Sarah Chen",
    date: "Mar 15, 2026",
    excerpt: "Learn which metrics matter most for your ecommerce business and how to track them effectively.",
    image: "📊",
  },
  {
    id: 2,
    title: "How to Reduce Customer Acquisition Cost by 40%",
    category: "Tips",
    author: "Mike Johnson",
    date: "Mar 12, 2026",
    excerpt: "Discover proven strategies to optimize your ad spend and lower your CAC across all channels.",
    image: "💰",
  },
  {
    id: 3,
    title: "New Feature: Real-Time Alerts & Notifications",
    category: "Updates",
    author: "Product Team",
    date: "Mar 10, 2026",
    excerpt: "Get instant notifications when your ROAS drops or inventory runs low. Stay ahead of issues.",
    image: "🔔",
  },
  {
    id: 4,
    title: "Amazon Advertising Changes: What You Need to Know",
    category: "Industry News",
    author: "James Wilson",
    date: "Mar 8, 2026",
    excerpt: "Amazon's new advertising policies could impact your campaigns. Here's what changed and how to adapt.",
    image: "📰",
  },
  {
    id: 5,
    title: "Multi-Channel Inventory Management Best Practices",
    category: "Tips",
    author: "Lisa Park",
    date: "Mar 5, 2026",
    excerpt: "Prevent stockouts and overstock situations with these proven inventory management strategies.",
    image: "📦",
  },
  {
    id: 6,
    title: "Q1 2026 Ecommerce Trends Report",
    category: "Industry News",
    author: "Analytics Team",
    date: "Mar 1, 2026",
    excerpt: "Analyze the latest ecommerce trends, consumer behavior shifts, and marketplace performance data.",
    image: "📈",
  },
  {
    id: 7,
    title: "Integrating SellerCloud with Your Dashboard",
    category: "Tips",
    author: "Dev Team",
    date: "Feb 28, 2026",
    excerpt: "Step-by-step guide to connecting SellerCloud API and automating your data sync.",
    image: "🔗",
  },
  {
    id: 8,
    title: "Platform Update: Improved Dashboard Performance",
    category: "Updates",
    author: "Engineering Team",
    date: "Feb 25, 2026",
    excerpt: "We've optimized our dashboards for 50% faster load times and smoother interactions.",
    image: "⚡",
  },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(blogPosts.map((post) => post.category)));
  const filtered = selectedCategory
    ? blogPosts.filter((post) => post.category === selectedCategory)
    : blogPosts;

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_255)]">
      {/* Header */}
      <div className="pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Blog & Insights
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Tips, updates, and industry news for ecommerce teams
        </p>
      </div>

      {/* Category Filter */}
      <div className="container mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === null
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/15"
            }`}
          >
            All Posts
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-slate-300 hover:bg-white/15"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all group"
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-blue-600/20 to-violet-600/20 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                {post.image}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-slate-400 text-sm">{post.excerpt}</p>

                {/* Author & CTA */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500">{post.author}</span>
                  </div>
                  <a
                    href={`/blog/${post.id}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No posts in this category yet.</p>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <div className="bg-white/5 border-t border-white/10 py-16">
        <div className="container max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Get insights delivered to your inbox
          </h2>
          <p className="text-slate-400 mb-6">
            Subscribe to our newsletter for weekly tips, updates, and industry news
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
