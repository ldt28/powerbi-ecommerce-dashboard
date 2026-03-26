/**
 * Dashboard Export Data Transformers
 * Functions to transform dashboard data for export formats
 */

/**
 * Transform Revenue Overview data for export
 */
export function transformRevenueData(data: any) {
  return {
    kpis: {
      "Total Revenue": data.totalRevenue || "$0",
      "Total Orders": data.totalOrders || "0",
      "Conversion Rate": data.conversionRate || "0%",
      "Average Order Value": data.avgOrderValue || "$0",
      "Month-over-Month Growth": data.momGrowth || "0%",
    },
    tables: [
      {
        title: "Monthly Revenue Trend",
        data: (data.monthlyTrend || []).map((item: any) => ({
          Month: item.month,
          Revenue: `$${item.revenue}`,
          Orders: item.orders,
          "Avg Order Value": `$${item.avgOrderValue}`,
        })),
      },
      {
        title: "Sales by Category",
        data: (data.categoryBreakdown || []).map((item: any) => ({
          Category: item.category,
          Revenue: `$${item.revenue}`,
          "% of Total": `${item.percentage}%`,
        })),
      },
      {
        title: "Top Products",
        data: (data.topProducts || []).map((item: any) => ({
          Product: item.name,
          Revenue: `$${item.revenue}`,
          Units: item.units,
          "Avg Price": `$${item.avgPrice}`,
        })),
      },
    ],
  };
}

/**
 * Transform Marketing Performance data for export
 */
export function transformMarketingData(data: any) {
  return {
    kpis: {
      "Total Ad Spend": data.totalAdSpend || "$0",
      "Total Revenue": data.totalRevenue || "$0",
      ROAS: data.roas || "0x",
      CPA: data.cpa || "$0",
      "Conversion Rate": data.conversionRate || "0%",
    },
    tables: [
      {
        title: "Campaign Performance",
        data: (data.campaigns || []).map((item: any) => ({
          Campaign: item.name,
          "Ad Spend": `$${item.spend}`,
          Impressions: item.impressions,
          Clicks: item.clicks,
          CTR: `${item.ctr}%`,
          Conversions: item.conversions,
          Revenue: `$${item.revenue}`,
          ROAS: `${item.roas}x`,
        })),
      },
      {
        title: "Channel Performance",
        data: (data.channels || []).map((item: any) => ({
          Channel: item.name,
          Spend: `$${item.spend}`,
          Revenue: `$${item.revenue}`,
          ROAS: `${item.roas}x`,
          CPA: `$${item.cpa}`,
        })),
      },
    ],
  };
}

/**
 * Transform Product Analysis data for export
 */
export function transformProductData(data: any) {
  return {
    kpis: {
      "Total Revenue": data.totalRevenue || "$0",
      "Total Profit": data.totalProfit || "$0",
      "Avg Margin": data.avgMargin || "0%",
      "Products in Stock": data.productsInStock || "0",
    },
    tables: [
      {
        title: "Top Sellers",
        data: (data.topSellers || []).map((item: any) => ({
          Product: item.name,
          Revenue: `$${item.revenue}`,
          Units: item.units,
          Margin: `${item.margin}%`,
          "Profit": `$${item.profit}`,
        })),
      },
      {
        title: "Inventory Levels",
        data: (data.inventory || []).map((item: any) => ({
          Product: item.name,
          "Stock Level": item.stock,
          "Reorder Point": item.reorderPoint,
          Status: item.status,
        })),
      },
      {
        title: "Category Breakdown",
        data: (data.categories || []).map((item: any) => ({
          Category: item.name,
          Revenue: `$${item.revenue}`,
          "% of Total": `${item.percentage}%`,
          "Avg Price": `$${item.avgPrice}`,
        })),
      },
    ],
  };
}

/**
 * Transform Customer Analytics data for export
 */
export function transformCustomerData(data: any) {
  return {
    kpis: {
      "New Customers": data.newCustomers || "0",
      "Avg LTV": data.avgLTV || "$0",
      "Retention Rate": data.retentionRate || "0%",
      "Repeat Purchase Rate": data.repeatPurchaseRate || "0%",
    },
    tables: [
      {
        title: "Customer Acquisition",
        data: (data.acquisition || []).map((item: any) => ({
          Month: item.month,
          "New Customers": item.new,
          "Acquisition Cost": `$${item.cost}`,
          "Lifetime Value": `$${item.ltv}`,
        })),
      },
      {
        title: "Customer Segments",
        data: (data.segments || []).map((item: any) => ({
          Segment: item.name,
          Count: item.count,
          "Avg LTV": `$${item.avgLTV}`,
          "Retention": `${item.retention}%`,
        })),
      },
      {
        title: "Cohort Analysis",
        data: (data.cohorts || []).map((item: any) => ({
          Cohort: item.month,
          Size: item.size,
          "Month 1": `${item.m1}%`,
          "Month 3": `${item.m3}%`,
          "Month 6": `${item.m6}%`,
        })),
      },
    ],
  };
}

/**
 * Transform Email Marketing data for export
 */
export function transformEmailData(data: any) {
  return {
    kpis: {
      "Emails Sent": data.emailsSent || "0",
      "Open Rate": data.openRate || "0%",
      "Click Rate": data.clickRate || "0%",
      "Conversion Rate": data.conversionRate || "0%",
      "Email Revenue": data.revenue || "$0",
    },
    tables: [
      {
        title: "Campaign Performance",
        data: (data.campaigns || []).map((item: any) => ({
          Campaign: item.campaign,
          Sent: item.sent,
          Opened: item.opened,
          "Open %": `${item.openRate}%`,
          Clicked: item.clicked,
          "Click %": `${item.clickRate}%`,
          Conversions: item.converted,
          "Conv %": `${item.conversionRate}%`,
          Revenue: `$${item.revenue}`,
        })),
      },
      {
        title: "Segment Performance",
        data: (data.segments || []).map((item: any) => ({
          Segment: item.segment,
          Sent: item.sent,
          "Open Rate": `${item.openRate}%`,
          "Click Rate": `${item.clickRate}%`,
          "Conv Rate": `${item.conversionRate}%`,
          Revenue: `$${item.revenue}`,
          "Revenue/Email": `$${item.revenuePerEmail}`,
        })),
      },
    ],
  };
}

/**
 * Generic data transformer that handles any dashboard data structure
 */
export function transformDashboardData(dashboardType: string, data: any) {
  switch (dashboardType.toLowerCase()) {
    case "revenue":
      return transformRevenueData(data);
    case "marketing":
      return transformMarketingData(data);
    case "products":
      return transformProductData(data);
    case "customers":
      return transformCustomerData(data);
    case "email":
      return transformEmailData(data);
    default:
      return { kpis: {}, tables: [] };
  }
}

/**
 * Format table data for CSV export
 */
export function formatTableForCSV(table: { title: string; data: Record<string, any>[] }) {
  if (!table.data || table.data.length === 0) {
    return [];
  }

  // Add table title as first row
  const titleRow = { [table.title]: "" };
  const emptyRow = {};

  return [titleRow, emptyRow, ...table.data];
}

/**
 * Combine multiple tables into single CSV export
 */
export function combineTablesToCSV(tables: Array<{ title: string; data: Record<string, any>[] }>) {
  const combinedData: Record<string, any>[] = [];

  tables.forEach((table, index) => {
    if (index > 0) {
      combinedData.push({}); // Add empty row between tables
    }

    // Add table title
    combinedData.push({ [table.title]: "" });
    combinedData.push({}); // Add empty row after title

    // Add table data
    combinedData.push(...table.data);
  });

  return combinedData;
}
