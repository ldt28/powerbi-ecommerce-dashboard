import React, { useMemo } from "react";
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
  Filler,
} from "chart.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: any;
  loading?: boolean;
}

/**
 * Revenue Trend Chart
 * Displays revenue trends over time across all platforms
 */
export function RevenueTrendChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: data.map((d: any) => d.date),
      datasets: [
        {
          label: "Revenue",
          data: data.map((d: any) => d.revenue),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "rgb(34, 197, 94)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Daily revenue across all platforms</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return "$" + value.toLocaleString();
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Platform Comparison Chart
 * Compares metrics across different platforms
 */
export function PlatformComparisonChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const platforms = data.map((d: any) => d.platform);
    const revenues = data.map((d: any) => d.revenue);
    const conversions = data.map((d: any) => d.conversions);

    return {
      labels: platforms,
      datasets: [
        {
          label: "Revenue ($)",
          data: revenues,
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 1,
        },
        {
          label: "Conversions",
          data: conversions,
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Comparison</CardTitle>
        <CardDescription>Revenue and conversions by platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Revenue Breakdown Pie Chart
 * Shows revenue distribution by platform
 */
export function RevenueBreakdownChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.byPlatform) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const platforms = Object.keys(data.byPlatform);
    const amounts = platforms.map((p) => data.byPlatform[p].amount);

    return {
      labels: platforms.map((p) => p.replace("_", " ").toUpperCase()),
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgb(34, 197, 94)",
            "rgb(59, 130, 246)",
            "rgb(239, 68, 68)",
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown</CardTitle>
        <CardDescription>Revenue distribution by platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Pie
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Conversion Funnel Chart
 * Shows conversion rates across the funnel
 */
export function ConversionFunnelChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: ["Impressions", "Clicks", "Conversions"],
      datasets: [
        {
          label: "Count",
          data: [data.impressions, data.clicks, data.conversions],
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(34, 197, 94, 0.7)",
            "rgba(168, 85, 247, 0.7)",
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(34, 197, 94)",
            "rgb(168, 85, 247)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          CTR: {data?.clickThroughRate?.toFixed(2)}% | CR: {data?.conversionRate?.toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y" as const,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ROI Analysis Chart
 * Compares ROI across platforms
 */
export function ROIAnalysisChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.byPlatform) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const platforms = Object.keys(data.byPlatform);
    const roiValues = platforms.map((p) => data.byPlatform[p].roi);

    return {
      labels: platforms.map((p) => p.replace("_", " ").toUpperCase()),
      datasets: [
        {
          label: "ROI (%)",
          data: roiValues,
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Analysis</CardTitle>
        <CardDescription>Return on investment by platform</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return value + "%";
                      },
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Spend vs Revenue Chart
 * Compares marketing spend against revenue
 */
export function SpendVsRevenueChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: data.map((d: any) => d.date),
      datasets: [
        {
          label: "Spend ($)",
          data: data.map((d: any) => d.spend),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Revenue ($)",
          data: data.map((d: any) => d.revenue),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend vs Revenue</CardTitle>
        <CardDescription>Marketing spend and revenue comparison</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: "index" as const,
                  intersect: false,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    type: "linear" as const,
                    display: true,
                    position: "left" as const,
                    ticks: {
                      callback: function (value) {
                        return "$" + value.toLocaleString();
                      },
                    },
                  },
                  y1: {
                    type: "linear" as const,
                    display: true,
                    position: "right" as const,
                    ticks: {
                      callback: function (value) {
                        return "$" + value.toLocaleString();
                      },
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Impressions and Clicks Chart
 * Tracks impressions and clicks over time
 */
export function ImpressionsClicksChart({ data, loading }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || !data.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: data.map((d: any) => d.date),
      datasets: [
        {
          label: "Impressions",
          data: data.map((d: any) => d.impressions),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Clicks",
          data: data.map((d: any) => d.clicks),
          borderColor: "rgb(168, 85, 247)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          fill: true,
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impressions & Clicks</CardTitle>
        <CardDescription>Daily impressions and clicks over time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : (
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: "index" as const,
                  intersect: false,
                },
                plugins: {
                  legend: {
                    display: true,
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    type: "linear" as const,
                    display: true,
                    position: "left" as const,
                  },
                  y1: {
                    type: "linear" as const,
                    display: true,
                    position: "right" as const,
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
