import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "orange";
  format?: "currency" | "number" | "percent";
  threshold?: {
    value: number;
    status: "good" | "warning" | "critical";
  };
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  icon,
  color = "blue",
  format = "number",
  threshold,
}: MetricCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-900 border-blue-200",
    green: "bg-green-50 text-green-900 border-green-200",
    red: "bg-red-50 text-red-900 border-red-200",
    yellow: "bg-yellow-50 text-yellow-900 border-yellow-200",
    purple: "bg-purple-50 text-purple-900 border-purple-200",
    orange: "bg-orange-50 text-orange-900 border-orange-200",
  };

  const formatValue = (val: number | string) => {
    if (typeof val === "string") return val;
    
    switch (format) {
      case "currency":
        return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
      case "percent":
        return `${val.toFixed(1)}%`;
      case "number":
      default:
        return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return "";
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getThresholdStatus = () => {
    if (!threshold) return null;
    const statusColors = {
      good: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      critical: "bg-red-100 text-red-800",
    };
    return statusColors[threshold.status];
  };

  return (
    <Card className={cn("border", colorClasses[color])}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-lg">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">{formatValue(value)}</div>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>

          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className={cn("text-xs font-medium", getTrendColor())}>
                {Math.abs(trend).toFixed(1)}% {trend > 0 ? "increase" : trend < 0 ? "decrease" : "no change"}
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">vs {trendLabel}</span>}
            </div>
          )}

          {threshold && (
            <div className={cn("inline-block px-2 py-1 rounded text-xs font-medium", getThresholdStatus())}>
              {threshold.status === "good" && "On Track"}
              {threshold.status === "warning" && "At Risk"}
              {threshold.status === "critical" && "Critical"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
