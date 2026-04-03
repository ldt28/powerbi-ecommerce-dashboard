import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Download, Settings, Plus, Trash2, Eye, EyeOff, Save, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MetricCardConfig {
  id?: number;
  metricKey: string;
  metricName: string;
  isVisible: boolean;
  cardColor: string;
  backgroundColor: string;
  textColor: string;
  cardSize: "small" | "medium" | "large";
  showTrend: boolean;
  showComparison: boolean;
  comparisonPeriod: "day" | "week" | "month" | "quarter" | "year";
  value?: number;
  trend?: number;
  comparison?: number;
}

interface DashboardThreshold {
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  thresholdType: "above" | "below" | "range";
  alertEnabled: boolean;
}

export default function CustomizableDashboard() {
  const [dashboardName, setDashboardName] = useState("My Dashboard");
  const [metrics, setMetrics] = useState<MetricCardConfig[]>([
    {
      metricKey: "total_revenue",
      metricName: "Order Revenue",
      isVisible: true,
      cardColor: "#ffffff",
      backgroundColor: "#f5f5f5",
      textColor: "#000000",
      cardSize: "medium",
      showTrend: true,
      showComparison: false,
      comparisonPeriod: "month",
      value: 0,
      trend: 12.5,
    },
    {
      metricKey: "true_aov",
      metricName: "True AOV",
      isVisible: true,
      cardColor: "#ffffff",
      backgroundColor: "#f5f5f5",
      textColor: "#000000",
      cardSize: "medium",
      showTrend: true,
      showComparison: false,
      comparisonPeriod: "month",
      value: 0,
    },
    {
      metricKey: "avg_order_value",
      metricName: "Average Order Value",
      isVisible: true,
      cardColor: "#ffffff",
      backgroundColor: "#f5f5f5",
      textColor: "#000000",
      cardSize: "medium",
      showTrend: true,
      showComparison: false,
      comparisonPeriod: "month",
      value: 0,
    },
  ]);

  const [thresholds, setThresholds] = useState<Record<string, DashboardThreshold>>({});
  const [sortBy, setSortBy] = useState<"name" | "value" | "custom">("custom");
  const [filterBy, setFilterBy] = useState<"all" | "visible" | "hidden">("all");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricCardConfig | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Fetch active alerts
  const { data: activeAlerts } = trpc.dashboardCustomization.getActiveAlerts.useQuery();

  useEffect(() => {
    if (activeAlerts) {
      setAlerts(activeAlerts);
    }
  }, [activeAlerts]);

  // Sort metrics
  const sortedMetrics = [...metrics].sort((a, b) => {
    if (sortBy === "name") return a.metricName.localeCompare(b.metricName);
    if (sortBy === "value") return (b.value || 0) - (a.value || 0);
    return 0;
  });

  // Filter metrics
  const filteredMetrics = sortedMetrics.filter((m) => {
    if (filterBy === "visible") return m.isVisible;
    if (filterBy === "hidden") return !m.isVisible;
    return true;
  });

  // Toggle metric visibility
  const toggleMetricVisibility = (metricKey: string) => {
    setMetrics(
      metrics.map((m) => (m.metricKey === metricKey ? { ...m, isVisible: !m.isVisible } : m))
    );
  };

  // Update metric card customization
  const updateMetricCard = (metricKey: string, updates: Partial<MetricCardConfig>) => {
    setMetrics(
      metrics.map((m) => (m.metricKey === metricKey ? { ...m, ...updates } : m))
    );
  };

  // Delete metric from dashboard
  const deleteMetric = (metricKey: string) => {
    setMetrics(metrics.filter((m) => m.metricKey !== metricKey));
  };

  // Add new metric
  const addMetric = () => {
    const newMetric: MetricCardConfig = {
      metricKey: `metric_${Date.now()}`,
      metricName: "New Metric",
      isVisible: true,
      cardColor: "#ffffff",
      backgroundColor: "#f5f5f5",
      textColor: "#000000",
      cardSize: "medium",
      showTrend: true,
      showComparison: false,
      comparisonPeriod: "month",
      value: 0,
    };
    setMetrics([...metrics, newMetric]);
  };

  // Get alert status for metric
  const getMetricAlertStatus = (metricKey: string) => {
    const metricAlerts = alerts.filter((a) => a.metricCardId === metricKey);
    if (metricAlerts.some((a) => a.alertType === "critical")) return "critical";
    if (metricAlerts.some((a) => a.alertType === "warning")) return "warning";
    return null;
  };

  // Determine card background based on threshold
  const getCardBackground = (metric: MetricCardConfig) => {
    const threshold = thresholds[metric.metricKey];
    if (!threshold?.alertEnabled) return metric.backgroundColor;

    const value = metric.value || 0;
    if (threshold.thresholdType === "above") {
      if (threshold.criticalThreshold && value < threshold.criticalThreshold) return "#fee2e2";
      if (threshold.warningThreshold && value < threshold.warningThreshold) return "#fef3c7";
    } else if (threshold.thresholdType === "below") {
      if (threshold.criticalThreshold && value > threshold.criticalThreshold) return "#fee2e2";
      if (threshold.warningThreshold && value > threshold.warningThreshold) return "#fef3c7";
    }
    return metric.backgroundColor;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{dashboardName}</h1>
            <p className="text-sm text-muted-foreground mt-1">Customize your analytics dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
              <Settings className="w-4 h-4 mr-2" />
              {isEditMode ? "Done Editing" : "Edit Dashboard"}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
            </AlertDescription>
          </Alert>
        )}

        {/* Customization Controls */}
        {isEditMode && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Dashboard Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm">Sort By</Label>
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom Order</SelectItem>
                      <SelectItem value="name">Metric Name</SelectItem>
                      <SelectItem value="value">Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Filter By</Label>
                  <Select value={filterBy} onValueChange={(v: any) => setFilterBy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      <SelectItem value="visible">Visible Only</SelectItem>
                      <SelectItem value="hidden">Hidden Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Dashboard Name</Label>
                  <Input
                    value={dashboardName}
                    onChange={(e) => setDashboardName(e.target.value)}
                    placeholder="Dashboard name"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button onClick={addMetric} size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMetrics.map((metric) => (
            <div key={metric.metricKey} className="relative group">
              <Card
                style={{
                  backgroundColor: getCardBackground(metric),
                  borderColor: getMetricAlertStatus(metric.metricKey) === "critical" ? "#dc2626" : 
                               getMetricAlertStatus(metric.metricKey) === "warning" ? "#f59e0b" : "transparent",
                  borderWidth: getMetricAlertStatus(metric.metricKey) ? "2px" : "1px",
                }}
                className={`${metric.cardSize === "small" ? "h-32" : metric.cardSize === "large" ? "h-64" : "h-48"} flex flex-col justify-between`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle
                      className="text-sm font-medium"
                      style={{ color: metric.textColor }}
                    >
                      {metric.metricName}
                    </CardTitle>
                    {isEditMode && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedMetric(metric)}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Customize {metric.metricName}</DialogTitle>
                            </DialogHeader>
                            {selectedMetric?.metricKey === metric.metricKey && (
                              <div className="space-y-4">
                                <Tabs defaultValue="appearance" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                                  </TabsList>

                                  {/* Appearance Tab */}
                                  <TabsContent value="appearance" className="space-y-4">
                                    <div>
                                      <Label>Card Size</Label>
                                      <Select
                                        value={metric.cardSize}
                                        onValueChange={(v: any) =>
                                          updateMetricCard(metric.metricKey, { cardSize: v })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="small">Small</SelectItem>
                                          <SelectItem value="medium">Medium</SelectItem>
                                          <SelectItem value="large">Large</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label>Card Color</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={metric.cardColor}
                                          onChange={(e) =>
                                            updateMetricCard(metric.metricKey, { cardColor: e.target.value })
                                          }
                                          className="w-12 h-10"
                                        />
                                        <Input
                                          value={metric.cardColor}
                                          onChange={(e) =>
                                            updateMetricCard(metric.metricKey, { cardColor: e.target.value })
                                          }
                                          placeholder="#ffffff"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label>Background Color</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={metric.backgroundColor}
                                          onChange={(e) =>
                                            updateMetricCard(metric.metricKey, { backgroundColor: e.target.value })
                                          }
                                          className="w-12 h-10"
                                        />
                                        <Input
                                          value={metric.backgroundColor}
                                          onChange={(e) =>
                                            updateMetricCard(metric.metricKey, { backgroundColor: e.target.value })
                                          }
                                          placeholder="#f5f5f5"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label>Text Color</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={metric.textColor}
                                          onChange={(e) =>
                                            updateMetricCard(metric.metricKey, { textColor: e.target.value })
                                          }
                                          className="w-12 h-10"
                                        />
                                        <Input
                                          value={metric.textColor}
                                          onChange={(e) =>
                                            updateMetricCard(metric.metricKey, { textColor: e.target.value })
                                          }
                                          placeholder="#000000"
                                        />
                                      </div>
                                    </div>
                                  </TabsContent>

                                  {/* Settings Tab */}
                                  <TabsContent value="settings" className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={metric.showTrend}
                                        onCheckedChange={(checked) =>
                                          updateMetricCard(metric.metricKey, { showTrend: checked as boolean })
                                        }
                                      />
                                      <Label>Show Trend</Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={metric.showComparison}
                                        onCheckedChange={(checked) =>
                                          updateMetricCard(metric.metricKey, { showComparison: checked as boolean })
                                        }
                                      />
                                      <Label>Show Comparison</Label>
                                    </div>

                                    {metric.showComparison && (
                                      <div>
                                        <Label>Comparison Period</Label>
                                        <Select
                                          value={metric.comparisonPeriod}
                                          onValueChange={(v: any) =>
                                            updateMetricCard(metric.metricKey, { comparisonPeriod: v })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="day">Day</SelectItem>
                                            <SelectItem value="week">Week</SelectItem>
                                            <SelectItem value="month">Month</SelectItem>
                                            <SelectItem value="quarter">Quarter</SelectItem>
                                            <SelectItem value="year">Year</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </TabsContent>

                                  {/* Alerts Tab */}
                                  <TabsContent value="alerts" className="space-y-4">
                                    <div>
                                      <Label>Target Value</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        onChange={(e) =>
                                          setThresholds({
                                            ...thresholds,
                                            [metric.metricKey]: {
                                              ...thresholds[metric.metricKey],
                                              targetValue: parseFloat(e.target.value),
                                            },
                                          })
                                        }
                                      />
                                    </div>

                                    <div>
                                      <Label>Warning Threshold</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        onChange={(e) =>
                                          setThresholds({
                                            ...thresholds,
                                            [metric.metricKey]: {
                                              ...thresholds[metric.metricKey],
                                              warningThreshold: parseFloat(e.target.value),
                                            },
                                          })
                                        }
                                      />
                                    </div>

                                    <div>
                                      <Label>Critical Threshold</Label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        onChange={(e) =>
                                          setThresholds({
                                            ...thresholds,
                                            [metric.metricKey]: {
                                              ...thresholds[metric.metricKey],
                                              criticalThreshold: parseFloat(e.target.value),
                                            },
                                          })
                                        }
                                      />
                                    </div>

                                    <div>
                                      <Label>Threshold Type</Label>
                                      <Select
                                        value={thresholds[metric.metricKey]?.thresholdType || "above"}
                                        onValueChange={(v: any) =>
                                          setThresholds({
                                            ...thresholds,
                                            [metric.metricKey]: {
                                              ...thresholds[metric.metricKey],
                                              thresholdType: v,
                                            },
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="above">Above</SelectItem>
                                          <SelectItem value="below">Below</SelectItem>
                                          <SelectItem value="range">Range</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={thresholds[metric.metricKey]?.alertEnabled || false}
                                        onCheckedChange={(checked) =>
                                          setThresholds({
                                            ...thresholds,
                                            [metric.metricKey]: {
                                              ...thresholds[metric.metricKey],
                                              alertEnabled: checked as boolean,
                                            },
                                          })
                                        }
                                      />
                                      <Label>Enable Alerts</Label>
                                    </div>
                                  </TabsContent>
                                </Tabs>

                                <Button onClick={() => setSelectedMetric(null)} className="w-full">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMetricVisibility(metric.metricKey)}
                        >
                          {metric.isVisible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMetric(metric.metricKey)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p
                      className="text-3xl font-bold"
                      style={{ color: metric.textColor }}
                    >
                      ${metric.value?.toLocaleString()}
                    </p>
                    {metric.showTrend && metric.trend && (
                      <p className={`text-sm mt-2 ${metric.trend > 0 ? "text-green-600" : "text-red-600"}`}>
                        {metric.trend > 0 ? "↑" : "↓"} {Math.abs(metric.trend)}%
                      </p>
                    )}
                    {metric.showComparison && metric.comparison && (
                      <p className="text-xs text-muted-foreground mt-1">
                        vs last {metric.comparisonPeriod}: {metric.comparison > 0 ? "+" : ""}{metric.comparison}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMetrics.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No metrics to display</p>
              {isEditMode && (
                <Button onClick={addMetric}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Metric
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
