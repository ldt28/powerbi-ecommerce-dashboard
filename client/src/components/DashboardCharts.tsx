import { useMemo } from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Revenue Trend Line Chart
 */
export function RevenueTrendChart({ data }: { data: any[] }) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: "Revenue",
          data: data.map((d) => d.revenue),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

/**
 * Revenue by Marketplace Pie Chart
 */
export function RevenueByMarketplaceChart({ data }: { data: any[] }) {
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.name),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: colors.slice(0, data.length),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => `$${context.parsed.toFixed(2)}`,
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
}

/**
 * Ad Spend vs Revenue Bar Chart
 */
export function AdSpendVsRevenueChart({ data }: { data: any[] }) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: "Ad Spend",
          data: data.map((d) => d.spend),
          backgroundColor: "#ef4444",
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: "Revenue",
          data: data.map((d) => d.revenue),
          backgroundColor: "#10b981",
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

/**
 * ROAS Trend Chart
 */
export function ROASTrendChart({ data }: { data: any[] }) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: "ROAS (Return on Ad Spend)",
          data: data.map((d) => d.roas),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#8b5cf6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(2)}x`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}x`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

/**
 * Top Products Bar Chart
 */
export function TopProductsChart({ data }: { data: any[] }) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.name),
      datasets: [
        {
          label: "Revenue",
          data: data.map((d) => d.revenue),
          backgroundColor: "#3b82f6",
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => `$${context.parsed.x.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

/**
 * Platform Distribution Doughnut Chart
 */
export function PlatformDistributionChart({ data }: { data: any[] }) {
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  const chartData = useMemo(() => {
    return {
      labels: data.map((d) => d.name),
      datasets: [
        {
          data: data.map((d) => d.value),
          backgroundColor: colors.slice(0, data.length),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          label: (context: any) => `${((context.parsed / context.dataset.data.reduce((a: number, b: any) => a + b, 0)) * 100).toFixed(1)}%`,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}

/**
 * KPI Card Component
 */
export function KPICard({
  title,
  value,
  format = "number",
  trend,
  icon,
}: {
  title: string;
  value: number;
  format?: "number" | "currency" | "percentage";
  trend?: { value: number; direction: "up" | "down" };
  icon?: React.ReactNode;
}) {
  const formatValue = () => {
    switch (format) {
      case "currency":
        return `$${value.toFixed(2)}`;
      case "percentage":
        return `${value.toFixed(2)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{formatValue()}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value).toFixed(2)}%
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

/**
 * Chart Container with Loading State
 */
export function ChartContainer({
  title,
  isLoading,
  error,
  children,
}: {
  title: string;
  isLoading?: boolean;
  error?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="relative h-64">{children}</div>
      )}
    </div>
  );
}
