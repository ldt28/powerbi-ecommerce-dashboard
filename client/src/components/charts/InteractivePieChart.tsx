import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface InteractivePieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: number;
  colors?: string[];
  onSliceClick?: (data: any) => void;
  showLegendToggle?: boolean;
}

export function InteractivePieChart({
  data,
  title,
  height = 300,
  colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"],
  onSliceClick,
  showLegendToggle = true,
}: InteractivePieChartProps) {
  const [visibleSlices, setVisibleSlices] = useState<Set<string>>(
    new Set(data.map((d) => d.name))
  );

  const toggleSlice = (name: string) => {
    const newVisible = new Set(visibleSlices);
    if (newVisible.has(name)) {
      newVisible.delete(name);
    } else {
      newVisible.add(name);
    }
    setVisibleSlices(newVisible);
  };

  const filteredData = data.filter((d) => visibleSlices.has(d.name));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data.value;
      const percentage = ((total / data.value) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm">{total.toLocaleString()}</p>
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
          {data.map((item) => (
            <Button
              key={item.name}
              variant={visibleSlices.has(item.name) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSlice(item.name)}
              className="gap-2"
            >
              {visibleSlices.has(item.name) ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {item.name}
            </Button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={(data) => onSliceClick?.(data)}
          >
            {filteredData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
