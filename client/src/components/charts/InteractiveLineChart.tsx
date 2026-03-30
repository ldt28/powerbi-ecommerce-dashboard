import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface InteractiveLineChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xAxisKey: string;
  title?: string;
  height?: number;
  showZoom?: boolean;
  showLegend?: boolean;
  colors?: string[];
  onDataPointClick?: (data: any) => void;
}

export function InteractiveLineChart({
  data,
  dataKey,
  xAxisKey,
  title,
  height = 300,
  showZoom = true,
  showLegend = true,
  colors = ["#3b82f6"],
  onDataPointClick,
}: InteractiveLineChartProps) {
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, data.length - 1]);
  const [hoveredData, setHoveredData] = useState<any>(null);

  const filteredData = useMemo(() => {
    const [start, end] = zoomRange;
    return data.slice(start, end + 1);
  }, [data, zoomRange]);

  const handleZoomIn = () => {
    const [start, end] = zoomRange;
    const range = end - start;
    const newStart = Math.max(0, start + Math.floor(range * 0.1));
    const newEnd = Math.min(data.length - 1, end - Math.floor(range * 0.1));
    setZoomRange([newStart, newEnd]);
  };

  const handleZoomOut = () => {
    const [start, end] = zoomRange;
    const range = end - start;
    const newStart = Math.max(0, start - Math.floor(range * 0.1));
    const newEnd = Math.min(data.length - 1, end + Math.floor(range * 0.1));
    setZoomRange([newStart, newEnd]);
  };

  const handleReset = () => {
    setZoomRange([0, data.length - 1]);
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

      {showZoom && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="gap-2"
          >
            <ZoomIn className="h-4 w-4" />
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="gap-2"
          >
            <ZoomOut className="h-4 w-4" />
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={filteredData}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              setHoveredData(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setHoveredData(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={colors[0]}
            strokeWidth={2}
            dot={{ fill: colors[0], r: 4 }}
            activeDot={{ r: 6 }}
            onClick={(data) => onDataPointClick?.(data)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
