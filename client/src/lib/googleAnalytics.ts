/**
 * Google Analytics Data Integration
 * Mock GA data for channel performance tracking
 */

export interface GAMetrics {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  revenue: number;
  transactions: number;
}

export interface GAChannelData {
  channel: string;
  metrics: GAMetrics;
  trend: Array<{
    date: string;
    sessions: number;
    users: number;
    revenue: number;
  }>;
  topPages: Array<{
    page: string;
    pageviews: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    sessions: number;
    conversionRate: number;
    revenue: number;
  }>;
}

// Mock Google Analytics data for each channel
export const googleAnalyticsData: Record<string, GAChannelData> = {
  amazon: {
    channel: "Amazon",
    metrics: {
      sessions: 45230,
      users: 32150,
      pageviews: 128450,
      bounceRate: 32.5,
      avgSessionDuration: 3.2,
      conversionRate: 3.8,
      revenue: 156000,
      transactions: 3120,
    },
    trend: [
      { date: "Jan", sessions: 38000, users: 27000, revenue: 125000 },
      { date: "Feb", sessions: 41000, users: 29000, revenue: 138000 },
      { date: "Mar", sessions: 45230, users: 32150, revenue: 156000 },
      { date: "Apr", sessions: 48000, users: 34000, revenue: 168000 },
      { date: "May", sessions: 52000, users: 37000, revenue: 182000 },
      { date: "Jun", sessions: 55000, users: 39000, revenue: 195000 },
    ],
    topPages: [
      { page: "/products/power-tools", pageviews: 32000, avgTimeOnPage: 4.2, bounceRate: 28.5 },
      { page: "/products/hand-tools", pageviews: 28000, avgTimeOnPage: 3.8, bounceRate: 31.2 },
      { page: "/checkout", pageviews: 12500, avgTimeOnPage: 5.1, bounceRate: 15.3 },
      { page: "/product-details", pageviews: 18000, avgTimeOnPage: 3.5, bounceRate: 35.8 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 22615, conversionRate: 2.8, revenue: 62400 },
      { device: "Desktop", sessions: 18092, conversionRate: 5.2, revenue: 78600 },
      { device: "Tablet", sessions: 4523, conversionRate: 2.1, revenue: 15000 },
    ],
  },
  ebay: {
    channel: "eBay",
    metrics: {
      sessions: 32150,
      users: 22890,
      pageviews: 89450,
      bounceRate: 38.2,
      avgSessionDuration: 2.8,
      conversionRate: 2.9,
      revenue: 98000,
      transactions: 2450,
    },
    trend: [
      { date: "Jan", sessions: 28000, users: 19000, revenue: 82000 },
      { date: "Feb", sessions: 30000, users: 21000, revenue: 89000 },
      { date: "Mar", sessions: 32150, users: 22890, revenue: 98000 },
      { date: "Apr", sessions: 34000, users: 24000, revenue: 105000 },
      { date: "May", sessions: 36000, users: 25500, revenue: 112000 },
      { date: "Jun", sessions: 38000, users: 27000, revenue: 125000 },
    ],
    topPages: [
      { page: "/listings", pageviews: 28000, avgTimeOnPage: 3.5, bounceRate: 35.2 },
      { page: "/auction-items", pageviews: 22000, avgTimeOnPage: 3.2, bounceRate: 40.1 },
      { page: "/buy-now", pageviews: 18450, avgTimeOnPage: 4.8, bounceRate: 22.5 },
      { page: "/seller-profile", pageviews: 21000, avgTimeOnPage: 2.9, bounceRate: 42.3 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 16075, conversionRate: 2.1, revenue: 39200 },
      { device: "Desktop", sessions: 12860, conversionRate: 3.8, revenue: 49600 },
      { device: "Tablet", sessions: 3215, conversionRate: 1.5, revenue: 9200 },
    ],
  },
  walmart: {
    channel: "Walmart",
    metrics: {
      sessions: 58900,
      users: 41850,
      pageviews: 165230,
      bounceRate: 28.3,
      avgSessionDuration: 3.8,
      conversionRate: 4.2,
      revenue: 156000,
      transactions: 3120,
    },
    trend: [
      { date: "Jan", sessions: 48000, users: 34000, revenue: 128000 },
      { date: "Feb", sessions: 52000, users: 37000, revenue: 142000 },
      { date: "Mar", sessions: 58900, users: 41850, revenue: 156000 },
      { date: "Apr", sessions: 62000, users: 44000, revenue: 168000 },
      { date: "May", sessions: 65000, users: 46000, revenue: 182000 },
      { date: "Jun", sessions: 68000, users: 48000, revenue: 195000 },
    ],
    topPages: [
      { page: "/home-improvement", pageviews: 42000, avgTimeOnPage: 4.5, bounceRate: 25.3 },
      { page: "/tools-hardware", pageviews: 38000, avgTimeOnPage: 4.1, bounceRate: 28.9 },
      { page: "/sale-items", pageviews: 28000, avgTimeOnPage: 3.2, bounceRate: 32.1 },
      { page: "/deals", pageviews: 32230, avgTimeOnPage: 3.8, bounceRate: 29.5 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 29450, conversionRate: 3.2, revenue: 62400 },
      { device: "Desktop", sessions: 23560, conversionRate: 5.5, revenue: 78600 },
      { device: "Tablet", sessions: 5890, conversionRate: 2.8, revenue: 15000 },
    ],
  },
  webstores: {
    channel: "WebStores",
    metrics: {
      sessions: 28500,
      users: 20250,
      pageviews: 78950,
      bounceRate: 22.1,
      avgSessionDuration: 4.5,
      conversionRate: 4.8,
      revenue: 112000,
      transactions: 2800,
    },
    trend: [
      { date: "Jan", sessions: 22000, users: 15500, revenue: 85000 },
      { date: "Feb", sessions: 24000, users: 17000, revenue: 95000 },
      { date: "Mar", sessions: 28500, users: 20250, revenue: 112000 },
      { date: "Apr", sessions: 30000, users: 21500, revenue: 125000 },
      { date: "May", sessions: 32000, users: 23000, revenue: 138000 },
      { date: "Jun", sessions: 35000, users: 25000, revenue: 155000 },
    ],
    topPages: [
      { page: "/professional-tools", pageviews: 24000, avgTimeOnPage: 5.2, bounceRate: 18.5 },
      { page: "/product-catalog", pageviews: 20000, avgTimeOnPage: 4.8, bounceRate: 22.3 },
      { page: "/featured-deals", pageviews: 18000, avgTimeOnPage: 4.1, bounceRate: 25.9 },
      { page: "/cart", pageviews: 16950, avgTimeOnPage: 3.5, bounceRate: 12.1 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 14250, conversionRate: 3.8, revenue: 44800 },
      { device: "Desktop", sessions: 11400, conversionRate: 6.2, revenue: 56000 },
      { device: "Tablet", sessions: 2850, conversionRate: 3.2, revenue: 11200 },
    ],
  },
  tractorSupply: {
    channel: "Tractor Supply",
    metrics: {
      sessions: 18900,
      users: 13450,
      pageviews: 52350,
      bounceRate: 35.8,
      avgSessionDuration: 3.1,
      conversionRate: 2.8,
      revenue: 68000,
      transactions: 1700,
    },
    trend: [
      { date: "Jan", sessions: 16000, users: 11000, revenue: 55000 },
      { date: "Feb", sessions: 17000, users: 12000, revenue: 60000 },
      { date: "Mar", sessions: 18900, users: 13450, revenue: 68000 },
      { date: "Apr", sessions: 20000, users: 14200, revenue: 75000 },
      { date: "May", sessions: 21000, users: 15000, revenue: 82000 },
      { date: "Jun", sessions: 22000, users: 15800, revenue: 90000 },
    ],
    topPages: [
      { page: "/farm-equipment", pageviews: 16000, avgTimeOnPage: 3.8, bounceRate: 32.5 },
      { page: "/tractor-parts", pageviews: 14000, avgTimeOnPage: 3.2, bounceRate: 38.9 },
      { page: "/seasonal-sales", pageviews: 12000, avgTimeOnPage: 2.8, bounceRate: 42.1 },
      { page: "/tools", pageviews: 10350, avgTimeOnPage: 3.1, bounceRate: 35.2 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 9450, conversionRate: 2.1, revenue: 27200 },
      { device: "Desktop", sessions: 7560, conversionRate: 3.5, revenue: 34000 },
      { device: "Tablet", sessions: 1890, conversionRate: 1.8, revenue: 6800 },
    ],
  },
  autozone: {
    channel: "AutoZone",
    metrics: {
      sessions: 24500,
      users: 17450,
      pageviews: 68000,
      bounceRate: 31.2,
      avgSessionDuration: 3.4,
      conversionRate: 3.2,
      revenue: 85000,
      transactions: 2125,
    },
    trend: [
      { date: "Jan", sessions: 20000, users: 14000, revenue: 68000 },
      { date: "Feb", sessions: 21500, users: 15200, revenue: 75000 },
      { date: "Mar", sessions: 24500, users: 17450, revenue: 85000 },
      { date: "Apr", sessions: 26000, users: 18500, revenue: 92000 },
      { date: "May", sessions: 27500, users: 19500, revenue: 100000 },
      { date: "Jun", sessions: 29000, users: 20500, revenue: 110000 },
    ],
    topPages: [
      { page: "/auto-tools", pageviews: 20000, avgTimeOnPage: 3.9, bounceRate: 28.5 },
      { page: "/diagnostic-equipment", pageviews: 18000, avgTimeOnPage: 3.6, bounceRate: 32.1 },
      { page: "/parts-finder", pageviews: 16000, avgTimeOnPage: 3.2, bounceRate: 35.8 },
      { page: "/promotions", pageviews: 14000, avgTimeOnPage: 2.9, bounceRate: 38.2 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 12250, conversionRate: 2.4, revenue: 34000 },
      { device: "Desktop", sessions: 9800, conversionRate: 4.1, revenue: 42500 },
      { device: "Tablet", sessions: 2450, conversionRate: 2.0, revenue: 8500 },
    ],
  },
  northernTool: {
    channel: "Northern Tool",
    metrics: {
      sessions: 35600,
      users: 25350,
      pageviews: 98900,
      bounceRate: 26.5,
      avgSessionDuration: 4.2,
      conversionRate: 3.9,
      revenue: 149000,
      transactions: 2000,
    },
    trend: [
      { date: "Jan", sessions: 29000, users: 20500, revenue: 120000 },
      { date: "Feb", sessions: 31000, users: 22000, revenue: 130000 },
      { date: "Mar", sessions: 35600, users: 25350, revenue: 149000 },
      { date: "Apr", sessions: 38000, users: 27000, revenue: 162000 },
      { date: "May", sessions: 40000, users: 28500, revenue: 175000 },
      { date: "Jun", sessions: 42000, users: 30000, revenue: 190000 },
    ],
    topPages: [
      { page: "/industrial-tools", pageviews: 30000, avgTimeOnPage: 4.8, bounceRate: 22.3 },
      { page: "/power-equipment", pageviews: 26000, avgTimeOnPage: 4.5, bounceRate: 25.1 },
      { page: "/heavy-duty-gear", pageviews: 22000, avgTimeOnPage: 4.1, bounceRate: 28.9 },
      { page: "/bulk-orders", pageviews: 20900, avgTimeOnPage: 3.8, bounceRate: 31.2 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 17800, conversionRate: 2.9, revenue: 59600 },
      { device: "Desktop", sessions: 14240, conversionRate: 5.1, revenue: 74500 },
      { device: "Tablet", sessions: 3560, conversionRate: 2.5, revenue: 14900 },
    ],
  },
  lowes: {
    channel: "Lowe's",
    metrics: {
      sessions: 42300,
      users: 30100,
      pageviews: 117850,
      bounceRate: 29.8,
      avgSessionDuration: 3.9,
      conversionRate: 3.7,
      revenue: 142000,
      transactions: 2840,
    },
    trend: [
      { date: "Jan", sessions: 35000, users: 25000, revenue: 115000 },
      { date: "Feb", sessions: 38000, users: 27000, revenue: 128000 },
      { date: "Mar", sessions: 42300, users: 30100, revenue: 142000 },
      { date: "Apr", sessions: 45000, users: 32000, revenue: 155000 },
      { date: "May", sessions: 48000, users: 34000, revenue: 168000 },
      { date: "Jun", sessions: 51000, users: 36000, revenue: 185000 },
    ],
    topPages: [
      { page: "/home-improvement", pageviews: 35000, avgTimeOnPage: 4.3, bounceRate: 26.5 },
      { page: "/tools-hardware", pageviews: 32000, avgTimeOnPage: 4.0, bounceRate: 29.8 },
      { page: "/seasonal-items", pageviews: 28000, avgTimeOnPage: 3.6, bounceRate: 33.2 },
      { page: "/deals-clearance", pageviews: 22850, avgTimeOnPage: 3.3, bounceRate: 35.9 },
    ],
    deviceBreakdown: [
      { device: "Mobile", sessions: 21150, conversionRate: 2.8, revenue: 56800 },
      { device: "Desktop", sessions: 16920, conversionRate: 4.9, revenue: 71000 },
      { device: "Tablet", sessions: 4230, conversionRate: 2.6, revenue: 14200 },
    ],
  },
};

/**
 * Get GA data for a specific channel
 */
export function getChannelGAData(channelId: string): GAChannelData | null {
  return googleAnalyticsData[channelId] || null;
}

/**
 * Calculate GA metrics summary across all channels
 */
export function getAggregateGAMetrics() {
  const channels = Object.values(googleAnalyticsData);
  return {
    totalSessions: channels.reduce((sum, c) => sum + c.metrics.sessions, 0),
    totalUsers: channels.reduce((sum, c) => sum + c.metrics.users, 0),
    totalPageviews: channels.reduce((sum, c) => sum + c.metrics.pageviews, 0),
    avgBounceRate: channels.reduce((sum, c) => sum + c.metrics.bounceRate, 0) / channels.length,
    avgSessionDuration: channels.reduce((sum, c) => sum + c.metrics.avgSessionDuration, 0) / channels.length,
    totalRevenue: channels.reduce((sum, c) => sum + c.metrics.revenue, 0),
    totalTransactions: channels.reduce((sum, c) => sum + c.metrics.transactions, 0),
  };
}
