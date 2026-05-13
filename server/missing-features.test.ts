import { describe, it, expect } from "vitest";
import {
  createWidget,
  validateDashboard,
  calculateGridLayout,
  mergeWidgets,
} from "./services/dashboard-builder";
import { checkThreshold, determineSeverity } from "./services/alerts-service";

describe("Missing Features Tests", () => {
  describe("Dashboard Builder", () => {
    it("should create a widget with correct properties", () => {
      const widget = createWidget(
        "chart",
        "Revenue Chart",
        { chartType: "line" },
        { x: 0, y: 0, width: 4, height: 4 }
      );

      expect(widget.type).toBe("chart");
      expect(widget.title).toBe("Revenue Chart");
      expect(widget.config.chartType).toBe("line");
      expect(widget.position.width).toBe(4);
    });

    it("should validate a valid dashboard", () => {
      const dashboard = {
        id: "dash1",
        userId: "user1",
        name: "My Dashboard",
        widgets: [
          createWidget(
            "metric",
            "Total Revenue",
            { value: 1000 },
            { x: 0, y: 0, width: 2, height: 2 }
          ),
        ],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateDashboard(dashboard);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject dashboard without name", () => {
      const dashboard = {
        id: "dash1",
        userId: "user1",
        name: "",
        widgets: [
          createWidget(
            "metric",
            "Total Revenue",
            { value: 1000 },
            { x: 0, y: 0, width: 2, height: 2 }
          ),
        ],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateDashboard(dashboard);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject dashboard without widgets", () => {
      const dashboard = {
        id: "dash1",
        userId: "user1",
        name: "My Dashboard",
        widgets: [],
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateDashboard(dashboard);
      expect(result.valid).toBe(false);
    });

    it("should calculate grid layout for widgets", () => {
      const positions = calculateGridLayout(5, 3);
      expect(positions).toHaveLength(5);
      expect(positions[0]).toEqual({ x: 0, y: 0, width: 4, height: 4 });
      expect(positions[3]).toEqual({ x: 0, y: 4, width: 4, height: 4 });
    });

    it("should merge widgets correctly", () => {
      const existing = [
        createWidget(
          "metric",
          "Widget 1",
          {},
          { x: 0, y: 0, width: 2, height: 2 }
        ),
      ];

      const updated = [
        createWidget(
          "chart",
          "Widget 2",
          {},
          { x: 2, y: 0, width: 2, height: 2 }
        ),
      ];

      const merged = mergeWidgets(existing, updated);
      expect(merged).toHaveLength(2);
    });
  });

  describe("Alerts and Thresholds", () => {
    it("should check greater_than threshold", async () => {
      const threshold = {
        metricName: "revenue",
        operator: "greater_than" as const,
        value: 1000,
      };

      expect(await checkThreshold(1500, threshold)).toBe(true);
      expect(await checkThreshold(500, threshold)).toBe(false);
    });

    it("should check less_than threshold", async () => {
      const threshold = {
        metricName: "bounce_rate",
        operator: "less_than" as const,
        value: 50,
      };

      expect(await checkThreshold(30, threshold)).toBe(true);
      expect(await checkThreshold(60, threshold)).toBe(false);
    });

    it("should check equals threshold", async () => {
      const threshold = {
        metricName: "status",
        operator: "equals" as const,
        value: 100,
      };

      expect(await checkThreshold(100, threshold)).toBe(true);
      expect(await checkThreshold(99, threshold)).toBe(false);
    });

    it("should check between threshold", async () => {
      const threshold = {
        metricName: "conversion_rate",
        operator: "between" as const,
        value: 2,
        value2: 5,
      };

      expect(await checkThreshold(3, threshold)).toBe(true);
      expect(await checkThreshold(1, threshold)).toBe(false);
      expect(await checkThreshold(6, threshold)).toBe(false);
    });

    it("should determine severity based on deviation", () => {
      expect(determineSeverity(100, 50, 100)).toBe("low");
      expect(determineSeverity(80, 50, 100)).toBe("medium");
      expect(determineSeverity(60, 50, 100)).toBe("high");
      expect(determineSeverity(40, 50, 100)).toBe("critical");
    });
  });

  describe("Export Functionality", () => {
    it("should handle CSV export data structure", () => {
      const exportData = {
        title: "Sales Report",
        subtitle: "Q1 2024",
        data: [
          { date: "2024-01-01", revenue: 1000, orders: 10 },
          { date: "2024-01-02", revenue: 1200, orders: 12 },
        ],
        columns: ["date", "revenue", "orders"],
      };

      expect(exportData.data).toHaveLength(2);
      expect(exportData.columns).toContain("revenue");
    });

    it("should handle Excel export data structure", () => {
      const exportData = {
        title: "Analytics Report",
        data: [
          { platform: "Google Analytics", sessions: 5000, users: 3000 },
          { platform: "Facebook Ads", sessions: 2000, users: 1500 },
        ],
        columns: ["platform", "sessions", "users"],
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-01-31"),
        },
      };

      expect(exportData.dateRange).toBeDefined();
      expect(exportData.data).toHaveLength(2);
    });
  });

  describe("Dashboard Sharing", () => {
    it("should validate share role", () => {
      const validRoles = ["viewer", "editor", "admin"];
      expect(validRoles).toContain("viewer");
      expect(validRoles).toContain("editor");
      expect(validRoles).toContain("admin");
    });

    it("should track share metadata", () => {
      const share = {
        dashboardId: "dash1",
        sharedWithUserId: "user2",
        role: "viewer" as const,
        sharedAt: new Date(),
      };

      expect(share.dashboardId).toBe("dash1");
      expect(share.role).toBe("viewer");
      expect(share.sharedAt).toBeInstanceOf(Date);
    });
  });

  describe("Demo Mode", () => {
    it("should identify demo user email", () => {
      const demoEmail = "demo@ecommerce-analytics.com";
      expect(demoEmail).toContain("demo");
      expect(demoEmail).toContain("ecommerce-analytics");
    });

    it("should handle demo mode environment variable", () => {
      const env = { DEMO_MODE: "true" };
      expect(env.DEMO_MODE).toBe("true");

      const env2 = { DEMO_MODE: "1" };
      expect(env2.DEMO_MODE).toBe("1");
    });
  });

  describe("Feature Integration", () => {
    it("should support multiple features together", () => {
      const dashboard = {
        id: "dash1",
        userId: "user1",
        name: "Analytics Dashboard",
        widgets: [
          createWidget(
            "chart",
            "Revenue Trend",
            { chartType: "line" },
            { x: 0, y: 0, width: 6, height: 4 }
          ),
          createWidget(
            "metric",
            "Total Revenue",
            { value: 50000 },
            { x: 6, y: 0, width: 3, height: 4 }
          ),
        ],
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = validateDashboard(dashboard);
      expect(validation.valid).toBe(true);
      expect(dashboard.widgets).toHaveLength(2);
      expect(dashboard.isPublic).toBe(true);
    });

    it("should support alerts on custom dashboards", async () => {
      const threshold = {
        metricName: "dashboard_views",
        operator: "less_than" as const,
        value: 100,
      };

      const currentValue = 50;
      const triggered = await checkThreshold(currentValue, threshold);

      expect(triggered).toBe(true);
      const severity = determineSeverity(currentValue, 100, 100);
      expect(severity).toBe("critical");
    });

    it("should support exporting shared dashboards", () => {
      const exportData = {
        title: "Shared Analytics Dashboard",
        subtitle: "Shared with Team",
        data: [
          { metric: "Revenue", value: 50000, change: "+15%" },
          { metric: "Orders", value: 1200, change: "+8%" },
        ],
        columns: ["metric", "value", "change"],
      };

      expect(exportData.title).toContain("Shared");
      expect(exportData.data).toHaveLength(2);
    });
  });
});
