import DashboardLayout from "@/components/DashboardLayout";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import type { FC } from "react";
import RevenueOverview from "./dashboard/RevenueOverview";
import MarketingPerformance from "./dashboard/MarketingPerformance";
import ProductAnalysis from "./dashboard/ProductAnalysis";
import DataManagement from "./dashboard/DataManagement";

const Dashboard: FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={RevenueOverview} />
        <Route path="/revenue" component={RevenueOverview} />
        <Route path="/marketing" component={MarketingPerformance} />
        <Route path="/products" component={ProductAnalysis} />
        <Route path="/data" component={DataManagement} />
      </Switch>
    </DashboardLayout>
  );
};

export default Dashboard;
