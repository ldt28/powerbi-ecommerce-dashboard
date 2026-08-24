import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Send,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  FileText,
  BarChart3,
  Bot,
  User,
  ArrowRight,
  Download,
  RefreshCw,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  metrics?: { label: string; value: string; change?: string; trend?: "up" | "down" | "neutral" }[];
  chartData?: {
    type: "line" | "bar" | "pie";
    title: string;
    data: any[];
    xAxisKey: string;
    dataKeys: string[];
  };
  recommendations?: string[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export default function AiAdvisor() {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      content:
        "Hello! I am your **EcomAI Strategic Advisor**. I analyze your store revenue, ad spend, marketing efficiency, and multi-channel metrics in real time. Ask me any question or click a prompt below to get started.",
      recommendations: [
        "Ask for a ROAS audit across Facebook, Google, and TikTok.",
        "Review your highest-margin product lines.",
        "Generate a complete 7-day executive briefing.",
      ],
      suggestedFollowUps: [
        "What is our blended ROAS across all ad channels?",
        "Which marketplace generated the highest margin?",
        "Are there any ad spend anomalies or budget leaks?",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [briefingTimeframe, setBriefingTimeframe] = useState<"7d" | "30d" | "90d">("7d");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: suggestions } = trpc.aiAdvisor.getPromptSuggestions.useQuery();
  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } =
    trpc.aiAdvisor.getExecutiveSummary.useQuery({ timeframe: briefingTimeframe });

  const askMutation = trpc.aiAdvisor.askQuestion.useMutation({
    onSuccess: (data) => {
      const assistantMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        content: data.answer,
        metrics: data.keyMetrics,
        chartData: data.chartData,
        recommendations: data.recommendations,
        suggestedFollowUps: data.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
    onError: (err) => {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        content: `Sorry, I encountered an issue analyzing your data: ${err.message}. Please try asking another question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, askMutation.isPending]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query || askMutation.isPending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    askMutation.mutate({ query });
  };

  const handleDownloadReport = () => {
    if (!summary) return;
    const reportText = `# EcomAnalytics Executive Briefing (${summary.period})
Generated: ${new Date(summary.generatedAt).toLocaleString()}

## High-Level Financials
- Total Revenue: $${summary.totalRevenue.toLocaleString()}
- Total Ad Spend: $${summary.totalSpend.toLocaleString()}
- Blended ROAS: ${summary.overallRoas}x
- Total Orders: ${summary.totalOrders}
- Average Order Value: $${summary.averageOrderValue}
- Growth Rate: +${summary.revenueGrowthRate}%

## Key Strategic Insights
${summary.keyInsights.map((i) => `- ${i}`).join("\n")}

## Channel Performance
${summary.channelPerformance.map((c) => `- ${c.channel}: $${c.revenue.toLocaleString()} Revenue | Spend: $${c.spend.toLocaleString()} | ROAS: ${c.roas}x`).join("\n")}

## Strategic Recommendations
${summary.strategicRecommendations.map((r) => `### [${r.priority.toUpperCase()}] ${r.title}\n- Action: ${r.action}\n- Expected Impact: ${r.expectedImpact}`).join("\n\n")}
`;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Executive_Briefing_${briefingTimeframe}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">EcomAI Strategic Advisor</h1>
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                Live Store Grounded
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Ask natural language questions about your store data or generate automated executive weekly summaries.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab("briefing");
                refetchSummary();
              }}
              className="gap-2"
            >
              <FileText className="h-4 w-4 text-primary" />
              Executive Briefing
            </Button>
            <Button
              size="sm"
              onClick={() => handleSendMessage("Generate an executive weekly briefing summary")}
              className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white"
            >
              <Zap className="h-4 w-4" />
              Quick Summary
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="chat" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Chat Console
            </TabsTrigger>
            <TabsTrigger value="briefing" className="gap-2">
              <FileText className="h-4 w-4" />
              Executive Briefings
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Chat Console */}
          <TabsContent value="chat" className="space-y-6">
            {/* Quick Suggestion Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recommended Inquiries
              </span>
              <div className="flex flex-wrap gap-2">
                {(suggestions || [
                  "What was our blended ROAS across all ad platforms?",
                  "Which sales channel generated the most profit this week?",
                  "Are there any ad spend anomalies or budget leaks?",
                  "What are our top 5 best selling products by margin?",
                ]).map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-full border-dashed hover:border-primary hover:text-primary transition-all"
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={askMutation.isPending}
                  >
                    <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* Chat Messages Container */}
            <Card className="border shadow-sm flex flex-col h-[600px] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20 mt-0.5">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-2xl p-4 space-y-4 text-sm ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground ml-12 rounded-br-none"
                          : "bg-card border shadow-xs mr-12 rounded-bl-none text-card-foreground"
                      }`}
                    >
                      <div className="leading-relaxed whitespace-pre-wrap">
                        {msg.content.split("**").map((chunk, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className="font-semibold text-foreground">
                              {chunk}
                            </strong>
                          ) : (
                            chunk
                          )
                        )}
                      </div>

                      {/* Embedded Key Metrics */}
                      {msg.metrics && msg.metrics.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
                          {msg.metrics.map((metric, idx) => (
                            <div key={idx} className="bg-muted/40 p-2.5 rounded-lg border">
                              <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
                              <p className="text-base font-bold mt-0.5">{metric.value}</p>
                              {metric.change && (
                                <div className="flex items-center gap-1 mt-1 text-xs">
                                  {metric.trend === "up" ? (
                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                  ) : metric.trend === "down" ? (
                                    <TrendingDown className="h-3 w-3 text-rose-500" />
                                  ) : null}
                                  <span
                                    className={
                                      metric.trend === "up"
                                        ? "text-emerald-500 font-medium"
                                        : metric.trend === "down"
                                        ? "text-rose-500 font-medium"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {metric.change}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Embedded Chart */}
                      {msg.chartData && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold text-muted-foreground mb-3">{msg.chartData.title}</p>
                          <div className="h-48 w-full bg-muted/20 rounded-lg p-2">
                            <ResponsiveContainer width="100%" height="100%">
                              {msg.chartData.type === "line" ? (
                                <LineChart data={msg.chartData.data}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                  <XAxis dataKey={msg.chartData.xAxisKey} tick={{ fontSize: 11 }} />
                                  <YAxis tick={{ fontSize: 11 }} />
                                  <Tooltip />
                                  <Legend />
                                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
                                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit ($)" />
                                </LineChart>
                              ) : (
                                <BarChart data={msg.chartData.data}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                  <XAxis dataKey={msg.chartData.xAxisKey} tick={{ fontSize: 11 }} />
                                  <YAxis tick={{ fontSize: 11 }} />
                                  <Tooltip />
                                  <Legend />
                                  {msg.chartData.dataKeys.map((key, i) => (
                                    <Bar
                                      key={key}
                                      dataKey={key}
                                      fill={i === 0 ? "#3b82f6" : "#10b981"}
                                      name={key.charAt(0).toUpperCase() + key.slice(1) + " ($)"}
                                      radius={[4, 4, 0, 0]}
                                    />
                                  ))}
                                </BarChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="pt-2 border-t space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                            <Lightbulb className="h-3.5 w-3.5" />
                            <span>Recommended Actions</span>
                          </div>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {msg.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Suggested Follow-ups */}
                      {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="pt-2 border-t space-y-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Suggested follow-ups:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedFollowUps.map((item, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(item)}
                                className="text-xs bg-muted/60 hover:bg-muted text-foreground px-2.5 py-1 rounded-md transition-colors text-left flex items-center gap-1"
                              >
                                <span>{item}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <span className="text-[10px] text-muted-foreground/70 block text-right pt-1">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === "user" && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {askMutation.isPending && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-card border rounded-2xl rounded-bl-none p-4 text-sm flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">Analyzing real-time store metrics...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t bg-card flex gap-2">
                <Input
                  placeholder="Ask a question (e.g. 'Why did ROAS shift this week?' or 'Top selling products')..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  disabled={askMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={askMutation.isPending || !inputQuery.trim()}
                  className="gap-2 shrink-0"
                >
                  <Send className="h-4 w-4" />
                  Ask Advisor
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: Executive Briefings */}
          <TabsContent value="briefing" className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Timeframe:</span>
                <div className="inline-flex rounded-lg border bg-muted/40 p-1">
                  {(["7d", "30d", "90d"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setBriefingTimeframe(tf)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        briefingTimeframe === tf ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "90 Days"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetchSummary()} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${isLoadingSummary ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button size="sm" onClick={handleDownloadReport} disabled={!summary} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Executive Report (.md)
                </Button>
              </div>
            </div>

            {isLoadingSummary || !summary ? (
              <div className="h-64 flex items-center justify-center border rounded-xl">
                <div className="text-center space-y-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Generating Executive Briefing...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Scorecard KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="p-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">${summary.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{summary.revenueGrowthRate}% vs prev</span>
                    </div>
                  </Card>

                  <Card className="p-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Blended ROAS</p>
                    <p className="text-2xl font-bold">{summary.overallRoas}x</p>
                    <p className="text-xs text-muted-foreground">Target: 3.20x</p>
                  </Card>

                  <Card className="p-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Total Ad Spend</p>
                    <p className="text-2xl font-bold">${summary.totalSpend.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Across all networks</p>
                  </Card>

                  <Card className="p-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{summary.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Completed checkouts</p>
                  </Card>

                  <Card className="p-4 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Average Order Value</p>
                    <p className="text-2xl font-bold">${summary.averageOrderValue}</p>
                    <p className="text-xs text-emerald-500 font-medium">Healthy Basket Size</p>
                  </Card>
                </div>

                {/* Key Insights & Anomaly Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <CardTitle className="text-base">Executive Key Insights</CardTitle>
                      </div>
                      <CardDescription>Synthesized from trailing performance and channel trends</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {summary.keyInsights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span
                            className="leading-snug text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html: insight.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>"),
                            }}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        <CardTitle className="text-base">Active Performance Anomalies</CardTitle>
                      </div>
                      <CardDescription>Items requiring executive attention or operational action</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {summary.anomalyAlerts.map((alert, idx) => (
                        <div key={idx} className="p-3 rounded-lg border bg-muted/30 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground">{alert.title}</span>
                            <Badge
                              variant="outline"
                              className={
                                alert.severity === "high" || alert.severity === "critical"
                                  ? "border-rose-500 text-rose-500"
                                  : "border-amber-500 text-amber-500"
                              }
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.description}</p>
                          <p className="text-xs font-medium text-primary">Impact: {alert.impact}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Channel Performance Matrix */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Channel Performance Breakdown</CardTitle>
                      </div>
                      <Badge variant="outline">
                        Top Channel: {summary.topChannel.name} ({summary.topChannel.share}%)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground text-xs text-left">
                            <th className="py-2.5 font-medium">Channel / Marketplace</th>
                            <th className="py-2.5 font-medium">Revenue</th>
                            <th className="py-2.5 font-medium">Ad Spend</th>
                            <th className="py-2.5 font-medium">ROAS</th>
                            <th className="py-2.5 font-medium">Orders</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-xs">
                          {summary.channelPerformance.map((ch, idx) => (
                            <tr key={idx} className="hover:bg-muted/40 transition-colors">
                              <td className="py-3 font-semibold text-foreground">{ch.channel}</td>
                              <td className="py-3">${ch.revenue.toLocaleString()}</td>
                              <td className="py-3">${ch.spend.toLocaleString()}</td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-medium ${
                                    ch.roas >= 3.5
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : ch.roas >= 2.5
                                      ? "bg-amber-500/10 text-amber-600"
                                      : "bg-rose-500/10 text-rose-600"
                                  }`}
                                >
                                  {ch.roas}x
                                </span>
                              </td>
                              <td className="py-3">{ch.orders}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Strategic Recommendations */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Prioritized Strategic Action Items</CardTitle>
                    </div>
                    <CardDescription>AI-generated growth interventions ranked by projected return</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summary.strategicRecommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-xl border bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">{rec.title}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {rec.category}
                            </Badge>
                          </div>
                          <Badge
                            className={
                              rec.priority === "high"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            }
                            variant="outline"
                          >
                            {rec.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rec.action}</p>
                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 pt-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Expected Return: {rec.expectedImpact}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
