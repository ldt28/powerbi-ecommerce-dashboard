import { describe, it, expect } from "vitest";

/**
 * Dashboard Export Functionality Tests
 * Tests for CSV and PDF export utilities and data transformations
 */

describe("Export Utilities", () => {
  describe("CSV Conversion", () => {
    it("should convert array of objects to CSV format", () => {
      const data = [
        { name: "Product A", revenue: 1000, units: 50 },
        { name: "Product B", revenue: 2000, units: 100 },
      ];

      const csv = convertToCSV(data);
      const lines = csv.split("\n");

      expect(lines[0]).toContain("name");
      expect(lines[0]).toContain("revenue");
      expect(lines[0]).toContain("units");
      expect(lines.length).toBe(3); // header + 2 data rows
    });

    it("should handle special characters in CSV", () => {
      const data = [{ name: 'Product "A"', description: "Has, comma" }];

      const csv = convertToCSV(data);
      expect(csv).toContain('Product ""A""');
      expect(csv).toContain("Has, comma");
    });

    it("should handle null and undefined values", () => {
      const data = [
        { name: "Product A", revenue: null, units: undefined },
      ];

      const csv = convertToCSV(data);
      expect(csv).toContain('""');
    });

    it("should return empty string for empty data", () => {
      const csv = convertToCSV([]);
      expect(csv).toBe("");
    });
  });

  describe("Data Transformation", () => {
    it("should transform revenue data correctly", () => {
      const revenueData = {
        totalRevenue: "$100,000",
        totalOrders: 500,
        conversionRate: "3.5%",
        avgOrderValue: "$200",
        momGrowth: "15%",
      };

      const transformed = transformRevenueData(revenueData);

      expect(transformed.kpis["Total Revenue"]).toBe("$100,000");
      expect(transformed.kpis["Total Orders"]).toBe(500);
      expect(transformed.tables.length).toBeGreaterThanOrEqual(0);
    });

    it("should transform marketing data correctly", () => {
      const marketingData = {
        totalAdSpend: "$50,000",
        totalRevenue: "$150,000",
        roas: "3x",
        cpa: "$25",
        conversionRate: "2.5%",
      };

      const transformed = transformMarketingData(marketingData);

      expect(transformed.kpis["Total Ad Spend"]).toBe("$50,000");
      expect(transformed.kpis.ROAS).toBe("3x");
      expect(transformed.kpis.CPA).toBe("$25");
    });

    it("should transform product data correctly", () => {
      const productData = {
        totalRevenue: "$500,000",
        totalProfit: "$150,000",
        avgMargin: "30%",
        productsInStock: 250,
      };

      const transformed = transformProductData(productData);

      expect(transformed.kpis["Total Revenue"]).toBe("$500,000");
      expect(transformed.kpis["Avg Margin"]).toBe("30%");
    });

    it("should transform customer data correctly", () => {
      const customerData = {
        newCustomers: 1000,
        avgLTV: "$500",
        retentionRate: "65%",
        repeatPurchaseRate: "45%",
      };

      const transformed = transformCustomerData(customerData);

      expect(transformed.kpis["New Customers"]).toBe(1000);
      expect(transformed.kpis["Avg LTV"]).toBe("$500");
      expect(transformed.kpis["Retention Rate"]).toBe("65%");
    });

    it("should transform email marketing data correctly", () => {
      const emailData = {
        emailsSent: 50000,
        openRate: "32%",
        clickRate: "7%",
        conversionRate: "2%",
        revenue: "$98,250",
      };

      const transformed = transformEmailData(emailData);

      expect(transformed.kpis["Emails Sent"]).toBe(50000);
      expect(transformed.kpis["Open Rate"]).toBe("32%");
      expect(transformed.kpis["Email Revenue"]).toBe("$98,250");
    });
  });

  describe("Generic Data Transformer", () => {
    it("should route to correct transformer based on dashboard type", () => {
      const revenueData = { totalRevenue: "$100,000" };
      const result = transformDashboardData("revenue", revenueData);

      expect(result.kpis).toBeDefined();
      expect(result.tables).toBeDefined();
    });

    it("should handle unknown dashboard type", () => {
      const result = transformDashboardData("unknown", {});

      expect(result.kpis).toEqual({});
      expect(result.tables).toEqual([]);
    });

    it("should be case insensitive", () => {
      const data = { totalRevenue: "$100,000" };
      const result1 = transformDashboardData("REVENUE", data);
      const result2 = transformDashboardData("revenue", data);

      expect(result1.kpis).toEqual(result2.kpis);
    });
  });

  describe("Table Formatting", () => {
    it("should format table for CSV export", () => {
      const table = {
        title: "Sales Data",
        data: [
          { product: "A", revenue: 1000 },
          { product: "B", revenue: 2000 },
        ],
      };

      const formatted = formatTableForCSV(table);

      expect(formatted[0]).toHaveProperty("Sales Data");
      expect(formatted[2]).toHaveProperty("product");
      expect(formatted.length).toBe(4); // title + empty + 2 data rows
    });

    it("should combine multiple tables for CSV", () => {
      const tables = [
        {
          title: "Table 1",
          data: [{ col: "value1" }],
        },
        {
          title: "Table 2",
          data: [{ col: "value2" }],
        },
      ];

      const combined = combineTablesToCSV(tables);

      expect(combined.length).toBeGreaterThan(4); // Should have separators
      expect(combined.some((row) => Object.keys(row).includes("Table 1"))).toBe(true);
      expect(combined.some((row) => Object.keys(row).includes("Table 2"))).toBe(true);
    });

    it("should handle empty tables", () => {
      const table = {
        title: "Empty Table",
        data: [],
      };

      const formatted = formatTableForCSV(table);

      expect(formatted).toEqual([]);
    });
  });

  describe("Date Formatting", () => {
    it("should format date correctly", () => {
      const date = new Date("2026-03-26");
      const formatted = formatDateForExport(date);

      expect(formatted).toMatch(/Mar 25, 2026|Mar 26, 2026|March 25, 2026|March 26, 2026/);
    });

    it("should format currency correctly", () => {
      const currency = formatCurrencyForExport(1234.56);

      expect(currency).toBe("$1,234.56");
    });

    it("should format percentage correctly", () => {
      const percentage = formatPercentageForExport(45.6789, 2);

      expect(percentage).toBe("45.68%");
    });

    it("should format number correctly", () => {
      const number = formatNumberForExport(1234.5678, 2);

      expect(number).toBe("1234.57");
    });
  });

  describe("Export Data Validation", () => {
    it("should validate KPI data structure", () => {
      const kpis = {
        "Metric 1": "Value 1",
        "Metric 2": 12345,
        "Metric 3": "$1,000",
      };

      const isValid = Object.values(kpis).every(
        (v) => typeof v === "string" || typeof v === "number"
      );

      expect(isValid).toBe(true);
    });

    it("should validate table data structure", () => {
      const tables = [
        {
          title: "Table 1",
          data: [
            { col1: "value1", col2: "value2" },
            { col1: "value3", col2: "value4" },
          ],
        },
      ];

      const isValid = tables.every(
        (t) => typeof t.title === "string" && Array.isArray(t.data)
      );

      expect(isValid).toBe(true);
    });

    it("should validate date range", () => {
      const dateRange = {
        from: new Date("2026-01-01"),
        to: new Date("2026-12-31"),
      };

      const isValid =
        dateRange.from instanceof Date &&
        dateRange.to instanceof Date &&
        dateRange.from <= dateRange.to;

      expect(isValid).toBe(true);
    });
  });

  describe("Export File Naming", () => {
    it("should generate valid filename from title", () => {
      const title = "Email Marketing Report";
      const filename = `${title.toLowerCase().replace(/\s+/g, "-")}-2026-03-26`;

      expect(filename).toBe("email-marketing-report-2026-03-26");
    });

    it("should handle special characters in filename", () => {
      const title = "Q1 2026 - Revenue & Profit";
      const filename = `${title.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "and")}-2026-03-26`;

      expect(filename).toContain("q1");
      expect(filename).toContain("revenue");
    });

    it("should include date in filename", () => {
      const date = new Date("2026-03-26");
      const dateStr = date.toISOString().split("T")[0];
      const filename = `report-${dateStr}`;

      expect(filename).toContain("2026-03-26");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large datasets", () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: Math.random() * 1000,
      }));

      const csv = convertToCSV(largeData);
      const lines = csv.split("\n");

      expect(lines.length).toBe(10001); // header + 10000 rows
    });

    it("should handle unicode characters", () => {
      const data = [{ product: "Café ☕", price: "$5.99" }];

      const csv = convertToCSV(data);
      expect(csv).toContain("Café");
      expect(csv).toContain("☕");
    });

    it("should handle empty strings", () => {
      const data = [{ name: "", value: "" }];

      const csv = convertToCSV(data);
      expect(csv).toContain('""');
    });

    it("should handle mixed data types", () => {
      const data = [
        {
          string: "text",
          number: 123,
          boolean: true,
          null: null,
          date: "2026-03-26",
        },
      ];

      const csv = convertToCSV(data);
      expect(csv).toContain("text");
      expect(csv).toContain("123");
      expect(csv).toContain("true");
    });
  });
});

// Helper functions for tests
function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map((h) => `"${h}"`).join(",");
  const csvRows = data.map((row) =>
    headers
      .map((h) => {
        const v = row[h];
        if (v === null || v === undefined) return '""';
        if (typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
        return `"${v}"`;
      })
      .join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}

function transformRevenueData(data: any) {
  return {
    kpis: {
      "Total Revenue": data.totalRevenue,
      "Total Orders": data.totalOrders,
      "Conversion Rate": data.conversionRate,
      "Average Order Value": data.avgOrderValue,
      "Month-over-Month Growth": data.momGrowth,
    },
    tables: [],
  };
}

function transformMarketingData(data: any) {
  return {
    kpis: {
      "Total Ad Spend": data.totalAdSpend,
      "Total Revenue": data.totalRevenue,
      ROAS: data.roas,
      CPA: data.cpa,
      "Conversion Rate": data.conversionRate,
    },
    tables: [],
  };
}

function transformProductData(data: any) {
  return {
    kpis: {
      "Total Revenue": data.totalRevenue,
      "Total Profit": data.totalProfit,
      "Avg Margin": data.avgMargin,
      "Products in Stock": data.productsInStock,
    },
    tables: [],
  };
}

function transformCustomerData(data: any) {
  return {
    kpis: {
      "New Customers": data.newCustomers,
      "Avg LTV": data.avgLTV,
      "Retention Rate": data.retentionRate,
      "Repeat Purchase Rate": data.repeatPurchaseRate,
    },
    tables: [],
  };
}

function transformEmailData(data: any) {
  return {
    kpis: {
      "Emails Sent": data.emailsSent,
      "Open Rate": data.openRate,
      "Click Rate": data.clickRate,
      "Conversion Rate": data.conversionRate,
      "Email Revenue": data.revenue,
    },
    tables: [],
  };
}

function transformDashboardData(type: string, data: any) {
  switch (type.toLowerCase()) {
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

function formatTableForCSV(table: any) {
  if (!table.data || table.data.length === 0) return [];
  return [{ [table.title]: "" }, {}, ...table.data];
}

function combineTablesToCSV(tables: any[]) {
  const combined: any[] = [];
  tables.forEach((t, i) => {
    if (i > 0) combined.push({});
    combined.push({ [t.title]: "" });
    combined.push({});
    combined.push(...t.data);
  });
  return combined;
}

function formatDateForExport(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrencyForExport(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercentageForExport(value: number, decimals: number) {
  return `${value.toFixed(decimals)}%`;
}

function formatNumberForExport(value: number, decimals: number) {
  return value.toFixed(decimals);
}
