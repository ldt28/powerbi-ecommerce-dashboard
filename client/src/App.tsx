import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { withProtectedRoute } from "./components/ProtectedRoute";
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
import TeamSettings from "./pages/TeamSettings";

const ProtectedDashboard = withProtectedRoute(Dashboard);
const ProtectedAdminDashboard = withProtectedRoute(AdminDashboard, "admin");
const ProtectedAnalytics = withProtectedRoute(AnalyticsDashboard);
const ProtectedConnections = withProtectedRoute(PlatformConnections);
const ProtectedCustomization = withProtectedRoute(CustomizableDashboard);
const ProtectedSettings = withProtectedRoute(Settings);
const ProtectedMarketplace = withProtectedRoute(MarketplaceComparison);
const ProtectedTeamManagement = withProtectedRoute(TeamManagement);
const ProtectedTeam = withProtectedRoute(Team);
const ProtectedNotificationSettings = withProtectedRoute(NotificationSettings);
const ProtectedTeamSettings = withProtectedRoute(TeamSettings);
const ProtectedSearch = withProtectedRoute(SearchAndFilters);
const ProtectedInvitations = withProtectedRoute(InviteTeamMembers);
const ProtectedActivityLogs = withProtectedRoute(ActivityLogs);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/blog" component={Blog} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/help" component={Help} />

      <Route path="/dashboard/customize" component={ProtectedCustomization} />
      <Route path="/dashboard" component={ProtectedDashboard} />
      <Route path="/dashboard/*" component={ProtectedDashboard} />
      <Route path="/admin/owner" component={ProtectedAdminDashboard} />
      <Route path="/analytics" component={ProtectedAnalytics} />
      <Route path="/settings/connections" component={ProtectedConnections} />
      <Route path="/settings" component={ProtectedSettings} />
      <Route path="/marketplace-comparison" component={ProtectedMarketplace} />
      <Route path="/team-management" component={ProtectedTeamManagement} />
      <Route path="/team" component={ProtectedTeam} />
      <Route path="/notification-settings" component={ProtectedNotificationSettings} />
      <Route path="/team-settings" component={ProtectedTeamSettings} />
      <Route path="/search-filters" component={ProtectedSearch} />
      <Route path="/invite-team" component={ProtectedInvitations} />
      <Route path="/activity-logs" component={ProtectedActivityLogs} />
      <Route path="/404" component={NotFound} />
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
