import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Documentation from "./pages/Documentation";
import CaseStudies from "./pages/CaseStudies";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminDashboard from "@/pages/AdminDashboard";
import AnalyticsDashboard from "@/pages/AnalyticsDashboard";
import PlatformConnections from "@/pages/PlatformConnections";
import CustomizableDashboard from "@/pages/CustomizableDashboard";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import MarketplaceComparison from "./pages/MarketplaceComparison";
import { CommandPalette } from "@/components/CommandPalette";
import TeamManagement from "./pages/TeamManagement";
import SearchAndFilters from "./pages/SearchAndFilters";
import InviteTeamMembers from "./pages/InviteTeamMembers";
import ActivityLogs from "./pages/ActivityLogs";
import Team from "./pages/Team";
import NotificationSettings from "./pages/NotificationSettings";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/blog" component={Blog} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/*" component={Dashboard} />
      <Route path="/admin/owner" component={AdminDashboard} />
      <Route path="/analytics" component={AnalyticsDashboard} />
      <Route path="/settings/connections" component={PlatformConnections} />
      <Route path="/dashboard/customize" component={CustomizableDashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route path="/marketplace-comparison" component={MarketplaceComparison} />
      <Route path="/team-management" component={TeamManagement} />
      <Route path="/team" component={Team} />
      <Route path="/notification-settings" component={NotificationSettings} />
      <Route path="/search-filters" component={SearchAndFilters} />
      <Route path="/invite-team" component={InviteTeamMembers} />
      <Route path="/activity-logs" component={ActivityLogs} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <CommandPalette />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
