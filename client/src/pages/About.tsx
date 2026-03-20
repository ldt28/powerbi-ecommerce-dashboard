import { Users, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_255)]">
      {/* Hero */}
      <div className="pt-20 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About Ecommerce Analytics
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          We're building the analytics platform that ecommerce teams actually want to use
        </p>
      </div>

      {/* Mission */}
      <div className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-400 mb-4">
              Ecommerce teams are drowning in data scattered across multiple marketplaces. They spend hours pulling reports from eBay, Amazon, BigCommerce, Walmart, and dozens of other platforms.
            </p>
            <p className="text-slate-400 mb-4">
              We built Ecommerce Analytics to solve this problem. One unified dashboard. Real-time data. Actionable insights. No spreadsheets, no manual work, no guesswork.
            </p>
            <p className="text-slate-400">
              Our goal is simple: help ecommerce teams make faster, smarter decisions so they can focus on growing their business.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "500+", label: "Active Users" },
              { number: "$2M+", label: "Revenue Tracked" },
              { number: "8", label: "Marketplaces Supported" },
              { number: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-bold text-blue-400">{stat.number}</div>
                <div className="text-sm text-slate-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white/5 border-y border-white/10 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "User-First",
                desc: "We build for real ecommerce teams. Every feature is tested by users who depend on it.",
              },
              {
                icon: Zap,
                title: "Speed & Reliability",
                desc: "Your data matters. We guarantee 99.9% uptime and real-time data sync.",
              },
              {
                icon: Users,
                title: "Transparency",
                desc: "No hidden fees, no surprises. Pricing is simple and our roadmap is public.",
              },
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-slate-400 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Team</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: "Alex Chen", role: "Founder & CEO", bio: "Former ecommerce founder, 10+ years in the space" },
            { name: "Sarah Williams", role: "CTO", bio: "Built analytics platforms at scale" },
            { name: "Mike Rodriguez", role: "Head of Product", bio: "Product leader with 500k+ users managed" },
            { name: "Lisa Park", role: "Head of Support", bio: "Obsessed with customer success" },
          ].map((member, i) => (
            <div key={i} className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="text-white font-semibold">{member.name}</h3>
              <p className="text-blue-400 text-sm mb-2">{member.role}</p>
              <p className="text-slate-400 text-xs">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border-t border-white/10 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            We're hiring! If you're passionate about ecommerce and analytics, we'd love to hear from you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-500">View Open Roles</Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Get in Touch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
