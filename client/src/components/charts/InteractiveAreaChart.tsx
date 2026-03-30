import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface InteractiveAreaChartProps {
  data: Array<Record<string, any>>;
  dataKeys: string[];
  xAxisKey: string;
  title?: string;
  height?: number;
  colors?: string[];
  onAreaClick?: (data: any) => void;
  stacked?: boolean;
}

export function InteractiveAreaChart({
  data,
  dataKeys,
  xAxisKey,
  title,
  height = 300,
  colors = ["#3b82f6", "#10b981", "#f59e0b"],
  onAreaClick,
  stacked = true,
}: InteractiveAreaChartProps) {
  const [visibleAreas, setVisibleAreas] = useState<Set<string>>(
    new Set(dataKeys)
  );

  const toggleArea = (key: string) => {
    const newVisible = new Set(visibleAreas);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleAreas(newVisible);
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

      <div className="flex flex-wrap gap-2">
        {dataKeys.map((key) => (
          <Button
            key={key}
            variant={visibleAreas.has(key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleArea(key)}
            className="gap-2"
          >
            {visibleAreas.has(key) ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {key}
          </Button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            {colors.map((color, index) => (
              <linearGradient
                key={`gradient-${index}`}
                id={`color-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            visibleAreas.has(key) && (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId={stacked ? "stack" : undefined}
                stroke={colors[index % colors.length]}
                fillOpacity={1}
                fill={`url(#color-${index})`}
                onClick={(data) => onAreaClick?.(data)}
              />
            )
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
