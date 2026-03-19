import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Route, Switch } from "wouter";
import RevenueOverview from "./dashboard/RevenueOverview";
import MarketingPerformance from "./dashboard/MarketingPerformance";
import ProductAnalysis from "./dashboard/ProductAnalysis";
import DataManagement from "./dashboard/DataManagement";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please log in to access the dashboard</div>;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={RevenueOverview} />
        <Route path="/dashboard/revenue" component={RevenueOverview} />
        <Route path="/dashboard/marketing" component={MarketingPerformance} />
        <Route path="/dashboard/products" component={ProductAnalysis} />
        <Route path="/dashboard/data" component={DataManagement} />
      </Switch>
    </DashboardLayout>
  );
}
