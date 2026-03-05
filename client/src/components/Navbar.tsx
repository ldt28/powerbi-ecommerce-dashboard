/**
 * Navbar Component
 * Design: Data-First Dark Analytics Hub
 * - Dark navy background with subtle border
 * - Electric blue accent on active/hover states
 * - DM Sans typography
 */

import { useState, useEffect } from "react";
import { BarChart3, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Dashboards", href: "#dashboards" },
  { label: "KPI Metrics", href: "#metrics" },
  { label: "Features", href: "#features" },
  { label: "Get Started", href: "#get-started" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.1_0.02_255/0.95)] backdrop-blur-md border-b border-white/8"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">DataPulse</span>
              <span className="text-blue-400 text-sm font-medium"> BI</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 rounded-md hover:bg-white/5"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleNavClick("#get-started")}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200"
            >
              View Dashboards
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[oklch(0.11_0.02_255)] border-t border-white/8 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
