import { useState, useEffect } from "react";
import { BarChart3, Menu, X, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

const navLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Documentation", href: "/documentation" },
  { label: "Blog", href: "/blog" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.13_0.02_255/0.95)] backdrop-blur-md border-b border-slate-700/50"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <BarChart3 className="w-7 h-7 text-blue-400" />
          <span className="font-bold text-white text-lg">EcomAnalytics</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href={getLoginUrl()}
            className="px-4 py-2 text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </a>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
          >
            Dashboard
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
                    aria-label="Toggle menu"
          className="md:hidden text-slate-400"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[oklch(0.13_0.02_255)] border-t border-slate-700/50 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
            >
              {link.label}
            </button>
          ))}
          <a
            href={getLoginUrl()}
            className="px-4 py-2 text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
            onClick={() => setMobileOpen(false)}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </a>
          <button
            onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
            className="mt-2 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
          >
            Dashboard
          </button>
        </div>
      )}
    </header>
  );
}
