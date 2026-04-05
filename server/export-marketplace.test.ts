import { describe, it, expect } from "vitest";
import {
  convertToCSV,
  generateCSVContent,
  formatDataForExcel,
  formatMarketplaceComparisonForExcel,
  exportMarketplaceComparisonToCSV,
  transformRevenueData,
  transformMarketingData,
} from "./export-utils";

describe("Export and Marketplace Comparison Features", () => {
  describe("CSV Export Utilities", () => {
    it("should convert array of objects to CSV format", () => {
      const data = [
        { platform: "Amazon", revenue: "$156,000", orders: "3,120" },
        { platform: "eBay", revenue: "$98,500", orders: "2,100" },
      ];

      const csv = convertToCSV(data);
      const lines = csv.split("\n");

      expect(lines[0]).toContain("platform");
      expect(lines[0]).toContain("revenue");
      expect(lines.length).toBe(3); // header + 2 data rows
    });

    it("should handle special characters in CSV", () => {
      const data = [{ platform: 'Amazon "Prime"', description: "Has, comma" }];

      const csv = convertToCSV(data);
      expect(csv).toContain('Amazon ""Prime""');
      expect(csv).toContain("Has, comma");
    });

    it("should handle null and undefined values in CSV", () => {
      const data = [{ platform: "Amazon", revenue: null, orders: undefined }];

      const csv = convertToCSV(data);
      expect(csv).toContain('""');
    });

    it("should return empty string for empty data", () => {
      const csv = convertToCSV([]);
      expect(csv).toBe("");
    });
  });

  describe("Dashboard Export Content Generation", () => {
    it("should generate CSV content with metrics and tables", () => {
      const exportData = {
        title: "Revenue Report",
        dateRange: "Jan 1 - Jan 31",
        metrics: {
          "Total Revenue": "$956,700",
          "Total Orders": "18,160",
        },
        tables: [
          {
            name: "Platform Performance",
            headers: ["Platform", "Revenue", "Orders"],
            rows: [
              ["Amazon", "$156,000", "3,120"],
              ["eBay", "$98,500", "2,100"],
            ],
          },
        ],
      };

      const csv = generateCSVContent(exportData);

      expect(csv).toContain("Revenue Report");
      expect(csv).toContain("Jan 1 - Jan 31");
      expect(csv).toContain("Total Revenue");
      expect(csv).toContain("$956,700");
      expect(csv).toContain("Platform Performance");
      expect(csv).toContain("Amazon");
    });

    it("should format data for Excel export", () => {
      const exportData = {
        title: "Revenue Report",
        dateRange: "Jan 1 - Jan 31",
        metrics: {
          "Total Revenue": "$956,700",
          "Total Orders": "18,160",
        },
      };

      const excelData = formatDataForExcel(exportData);

      expect(excelData[0][0]).toBe("Revenue Report");
      expect(excelData).toContainEqual(["Date Range", "Jan 1 - Jan 31"]);
      expect(excelData).toContainEqual(["Total Revenue", "$956,700"]);
    });
  });

  describe("Marketplace Comparison Export", () => {
    it("should export marketplace comparison to CSV", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {
            "Gross Revenue": "$156,000",
            "Total Orders": "3,120",
            "Conversion Rate": "3.2%",
          },
        },
        {
          name: "eBay",
          metrics: {
            "Gross Revenue": "$98,500",
            "Total Orders": "2,100",
            "Conversion Rate": "2.8%",
          },
        },
      ];

      const csv = exportMarketplaceComparisonToCSV(platforms, "Jan 1 - Jan 31");

      expect(csv).toContain("Marketplace Comparison Report");
      expect(csv).toContain("Jan 1 - Jan 31");
      expect(csv).toContain("Metric");
      expect(csv).toContain("Amazon");
      expect(csv).toContain("eBay");
      expect(csv).toContain("$156,000");
      expect(csv).toContain("3.2%");
    });

    it("should format marketplace comparison for Excel export", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {
            "Gross Revenue": "$156,000",
            "Total Orders": "3,120",
          },
        },
        {
          name: "eBay",
          metrics: {
            "Gross Revenue": "$98,500",
            "Total Orders": "2,100",
          },
        },
      ];

      const excelData = formatMarketplaceComparisonForExcel(platforms, "Jan 1 - Jan 31");

      expect(excelData[0][0]).toBe("Marketplace Comparison Report");
      expect(excelData).toContainEqual(["Date Range", "Jan 1 - Jan 31"]);
      expect(excelData).toContainEqual(["Metric", "Amazon", "eBay"]);
      expect(excelData).toContainEqual(["Gross Revenue", "$156,000", "$98,500"]);
    });

    it("should include individual platform sheets in Excel export", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {
            "Gross Revenue": "$156,000",
            "Total Orders": "3,120",
          },
        },
      ];

      const excelData = formatMarketplaceComparisonForExcel(platforms, "Jan 1 - Jan 31");

      // Check for individual platform section
      const amazonSectionIndex = excelData.findIndex(row => row[0] === "Amazon" && row.length === 1);
      expect(amazonSectionIndex).toBeGreaterThan(-1);

      // Check for metric rows after platform header
      const metricsStartIndex = amazonSectionIndex + 2;
      expect(excelData[metricsStartIndex]).toContain("Gross Revenue");
    });
  });

  describe("Data Transformation", () => {
    it("should transform revenue data correctly", () => {
      const revenueData = {
        totalRevenue: "$956,700",
        totalOrders: "18,160",
        conversionRate: "3.1%",
        avgOrderValue: "$52.67",
        momGrowth: "18.5%",
      };

      const transformed = transformRevenueData(revenueData);

      expect(transformed.kpis["Total Revenue"]).toBe("$956,700");
      expect(transformed.kpis["Total Orders"]).toBe("18,160");
      expect(transformed.kpis["Conversion Rate"]).toBe("3.1%");
      expect(transformed.kpis["MoM Growth"]).toBe("18.5%");
    });

    it("should transform marketing data correctly", () => {
      const marketingData = {
        totalAdSpend: "$125,000",
        totalRevenue: "$450,000",
        roas: "3.6x",
        cpa: "$35",
        conversionRate: "2.8%",
      };

      const transformed = transformMarketingData(marketingData);

      expect(transformed.kpis["Total Ad Spend"]).toBe("$125,000");
      expect(transformed.kpis["ROAS"]).toBe("3.6x");
      expect(transformed.kpis["CPA"]).toBe("$35");
      expect(transformed.kpis["Conversion Rate"]).toBe("2.8%");
    });
  });

  describe("Export Data Validation", () => {
    it("should handle large datasets in CSV export", () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        platform: `Platform ${i}`,
        revenue: `$${(Math.random() * 100000).toFixed(2)}`,
      }));

      const csv = convertToCSV(largeData);
      const lines = csv.split("\n");

      expect(lines.length).toBe(1001); // header + 1000 rows
    });

    it("should preserve numeric precision in exports", () => {
      const data = [
        {
          platform: "Amazon",
          revenue: 156000.50,
          conversionRate: 3.2456,
        },
      ];

      const csv = convertToCSV(data);

      expect(csv).toContain("156000.5");
      expect(csv).toContain("3.2456");
    });

    it("should handle special metrics in marketplace comparison", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {
            "Gross Revenue": "$156,000",
            "Return Rate": "1.8%",
            "Customer LTV": "$245.50",
            "Inventory Turnover": "12.3x",
          },
        },
      ];

      const csv = exportMarketplaceComparisonToCSV(platforms, "Jan 1 - Jan 31");

      expect(csv).toContain("Return Rate");
      expect(csv).toContain("1.8%");
      expect(csv).toContain("Customer LTV");
      expect(csv).toContain("$245.50");
      expect(csv).toContain("Inventory Turnover");
      expect(csv).toContain("12.3x");
    });
  });

  describe("Export Format Consistency", () => {
    it("should maintain consistent formatting across platforms", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {
            "Gross Revenue": "$156,000",
            "Total Orders": "3,120",
          },
        },
        {
          name: "eBay",
          metrics: {
            "Gross Revenue": "$98,500",
            "Total Orders": "2,100",
          },
        },
      ];

      const csv = exportMarketplaceComparisonToCSV(platforms, "Jan 1 - Jan 31");
      const lines = csv.split("\n").filter(line => line.trim());

      // Check that comparison section has consistent structure
      const comparisonStartIndex = lines.findIndex(line => line.includes("Metric"));
      expect(comparisonStartIndex).toBeGreaterThan(-1);

      // Verify header row exists with both platforms
      expect(lines[comparisonStartIndex]).toContain("Metric");
      expect(lines[comparisonStartIndex]).toContain("Amazon");
      expect(lines[comparisonStartIndex]).toContain("eBay");
    });

    it("should handle empty metrics gracefully", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {},
        },
      ];

      const excelData = formatMarketplaceComparisonForExcel(platforms, "Jan 1 - Jan 31");

      expect(excelData).toBeDefined();
      expect(excelData.length).toBeGreaterThan(0);
    });
  });

  describe("Performance Metrics Export", () => {
    it("should export all 8 platform metrics correctly", () => {
      const platforms = [
        {
          name: "Amazon",
          metrics: {
            "Gross Revenue": "$156,000",
            "Total Orders": "3,120",
            "Avg Order Value": "$50",
            "Conversion Rate": "3.2%",
            "New Customers": "468",
            "Returning Customer Revenue": "$101,400",
            "Units Sold": "4,680",
            "Returns": "56",
          },
        },
      ];

      const csv = exportMarketplaceComparisonToCSV(platforms, "Jan 1 - Jan 31");

      expect(csv).toContain("Gross Revenue");
      expect(csv).toContain("Total Orders");
      expect(csv).toContain("Avg Order Value");
      expect(csv).toContain("Conversion Rate");
      expect(csv).toContain("New Customers");
      expect(csv).toContain("Returning Customer Revenue");
      expect(csv).toContain("Units Sold");
      expect(csv).toContain("Returns");
    });
  });
});
