import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface InteractiveBarChartProps {
  data: Array<Record<string, any>>;
  dataKeys: string[];
  xAxisKey: string;
  title?: string;
  height?: number;
  colors?: string[];
  onBarClick?: (data: any) => void;
  showLegendToggle?: boolean;
}

export function InteractiveBarChart({
  data,
  dataKeys,
  xAxisKey,
  title,
  height = 300,
  colors = ["#3b82f6", "#ef4444", "#10b981"],
  onBarClick,
  showLegendToggle = true,
}: InteractiveBarChartProps) {
  const [visibleBars, setVisibleBars] = useState<Set<string>>(new Set(dataKeys));

  const toggleBar = (key: string) => {
    const newVisible = new Set(visibleBars);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleBars(newVisible);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data[xAxisKey]}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}

      {showLegendToggle && (
        <div className="flex flex-wrap gap-2">
          {dataKeys.map((key, index) => (
            <Button
              key={key}
              variant={visibleBars.has(key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleBar(key)}
              className="gap-2"
            >
              {visibleBars.has(key) ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {key}
            </Button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            visibleBars.has(key) && (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                onClick={(data) => onBarClick?.(data)}
                radius={[8, 8, 0, 0]}
              />
            )
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
