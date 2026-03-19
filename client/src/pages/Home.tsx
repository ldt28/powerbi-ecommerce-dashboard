/**
 * Home Page
 * Design: Data-First Dark Analytics Hub
 * Sections: Navbar → Hero → Overview → Dashboards → Metrics → Features → GetStarted → Footer
 */

import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OverviewSection from "@/components/OverviewSection";
import DashboardsSection from "@/components/DashboardsSection";
import MetricsSection from "@/components/MetricsSection";
import FeaturesSection from "@/components/FeaturesSection";
import GetStartedSection from "@/components/GetStartedSection";
import Footer from "@/components/Footer";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[oklch(0.1_0.02_255)]">
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <DashboardsSection />
      <MetricsSection />
      <FeaturesSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
}
