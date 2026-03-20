import DashboardLayout from "@/components/DashboardLayout";
import { Route, Switch } from "wouter";
import RevenueOverview from "./dashboard/RevenueOverview";
import MarketingPerformance from "./dashboard/MarketingPerformance";
import ProductAnalysis from "./dashboard/ProductAnalysis";
import DataManagement from "./dashboard/DataManagement";

export default function Dashboard() {
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
}
