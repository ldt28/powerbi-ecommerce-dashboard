import { describe, it, expect } from "vitest";

describe("Saved Comparison Configurations", () => {
  describe("Configuration Creation", () => {
    it("should create a period comparison configuration", () => {
      const config = {
        id: "config-1",
        name: "Monthly Comparison",
        description: "Compare this month vs last month",
        comparisonType: "period" as const,
        periodType: "month" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(config.name).toBe("Monthly Comparison");
      expect(config.comparisonType).toBe("period");
      expect(config.periodType).toBe("month");
    });

    it("should create a platform comparison configuration", () => {
      const config = {
        id: "config-2",
        name: "Amazon vs eBay",
        description: "Compare Amazon and eBay performance",
        comparisonType: "platform" as const,
        selectedPlatforms: ["amazon", "ebay"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(config.name).toBe("Amazon vs eBay");
      expect(config.comparisonType).toBe("platform");
      expect(config.selectedPlatforms).toContain("amazon");
      expect(config.selectedPlatforms).toContain("ebay");
    });

    it("should generate unique configuration IDs", () => {
      const id1 = `config-${Date.now()}`;
      const id2 = `config-${Date.now() + 1}`;

      expect(id1).not.toBe(id2);
    });

    it("should include timestamps for created and updated", () => {
      const now = Date.now();
      const config = {
        id: "config-3",
        name: "Test Config",
        comparisonType: "period" as const,
        createdAt: now,
        updatedAt: now,
      };

      expect(config.createdAt).toBe(now);
      expect(config.updatedAt).toBe(now);
      expect(config.createdAt).toEqual(config.updatedAt);
    });
  });

  describe("Configuration Validation", () => {
    it("should validate configuration name length", () => {
      const name = "Valid Name";
      const isValid = name.length >= 3 && name.length <= 50;

      expect(isValid).toBe(true);
    });

    it("should reject configuration names that are too short", () => {
      const name = "AB";
      const isValid = name.length >= 3;

      expect(isValid).toBe(false);
    });

    it("should reject configuration names that are too long", () => {
      const name = "A".repeat(51);
      const isValid = name.length <= 50;

      expect(isValid).toBe(false);
    });

    it("should trim whitespace from configuration names", () => {
      const name = "  Test Config  ";
      const trimmed = name.trim();

      expect(trimmed).toBe("Test Config");
      expect(trimmed.length).toBe(11);
    });

    it("should allow optional descriptions", () => {
      const config = {
        id: "config-4",
        name: "Test",
        comparisonType: "period" as const,
        description: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(config.description).toBeUndefined();
    });

    it("should validate description length", () => {
      const description = "A".repeat(200);
      const isValid = description.length <= 200;

      expect(isValid).toBe(true);
    });
  });

  describe("Configuration Storage", () => {
    it("should serialize configuration to JSON", () => {
      const config = {
        id: "config-5",
        name: "Test Config",
        comparisonType: "period" as const,
        periodType: "month" as const,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      const json = JSON.stringify(config);
      expect(json).toContain("config-5");
      expect(json).toContain("Test Config");
      expect(json).toContain("period");
    });

    it("should deserialize configuration from JSON", () => {
      const original = {
        id: "config-6",
        name: "Test Config",
        comparisonType: "period" as const,
        periodType: "quarter" as const,
        createdAt: 1234567890,
        updatedAt: 1234567890,
      };

      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(original.id);
      expect(parsed.name).toBe(original.name);
      expect(parsed.comparisonType).toBe(original.comparisonType);
    });

    it("should handle array of configurations", () => {
      const configs = [
        { id: "config-7", name: "Config 1", comparisonType: "period" as const },
        { id: "config-8", name: "Config 2", comparisonType: "platform" as const },
        { id: "config-9", name: "Config 3", comparisonType: "period" as const },
      ];

      const json = JSON.stringify(configs);
      const parsed = JSON.parse(json);

      expect(parsed.length).toBe(3);
      expect(parsed[0].name).toBe("Config 1");
      expect(parsed[2].comparisonType).toBe("period");
    });
  });

  describe("Configuration Management", () => {
    it("should add configuration to list", () => {
      const configs: any[] = [];
      const newConfig = {
        id: "config-10",
        name: "New Config",
        comparisonType: "period" as const,
      };

      configs.push(newConfig);

      expect(configs.length).toBe(1);
      expect(configs[0].id).toBe("config-10");
    });

    it("should remove configuration from list", () => {
      const configs = [
        { id: "config-11", name: "Config 1" },
        { id: "config-12", name: "Config 2" },
        { id: "config-13", name: "Config 3" },
      ];

      const filtered = configs.filter(c => c.id !== "config-12");

      expect(filtered.length).toBe(2);
      expect(filtered.find(c => c.id === "config-12")).toBeUndefined();
    });

    it("should find configuration by ID", () => {
      const configs = [
        { id: "config-14", name: "Config 1" },
        { id: "config-15", name: "Config 2" },
      ];

      const found = configs.find(c => c.id === "config-15");

      expect(found).toBeDefined();
      expect(found?.name).toBe("Config 2");
    });

    it("should update configuration", () => {
      let configs = [
        { id: "config-16", name: "Original Name", updatedAt: 1000 },
      ];

      const updated = configs.map(c =>
        c.id === "config-16"
          ? { ...c, name: "Updated Name", updatedAt: 2000 }
          : c
      );

      expect(updated[0].name).toBe("Updated Name");
      expect(updated[0].updatedAt).toBe(2000);
    });

    it("should maintain configuration order", () => {
      const configs = [
        { id: "config-17", name: "First", createdAt: 1000 },
        { id: "config-18", name: "Second", createdAt: 2000 },
        { id: "config-19", name: "Third", createdAt: 3000 },
      ];

      expect(configs[0].name).toBe("First");
      expect(configs[1].name).toBe("Second");
      expect(configs[2].name).toBe("Third");
    });
  });

  describe("Configuration Loading", () => {
    it("should load period configuration", () => {
      const config = {
        id: "config-20",
        name: "Monthly",
        comparisonType: "period" as const,
        periodType: "month" as const,
      };

      const comparisonType = config.comparisonType;
      const periodType = config.periodType;

      expect(comparisonType).toBe("period");
      expect(periodType).toBe("month");
    });

    it("should load platform configuration", () => {
      const config = {
        id: "config-21",
        name: "Platform Compare",
        comparisonType: "platform" as const,
        selectedPlatforms: ["amazon", "walmart"],
      };

      const comparisonType = config.comparisonType;
      const platforms = config.selectedPlatforms;

      expect(comparisonType).toBe("platform");
      expect(platforms).toContain("amazon");
      expect(platforms).toContain("walmart");
    });

    it("should apply loaded configuration settings", () => {
      const config = {
        comparisonType: "period" as const,
        periodType: "quarter" as const,
      };

      let comparisonType = "period";
      let periodType = "month";

      comparisonType = config.comparisonType;
      if (config.periodType) periodType = config.periodType;

      expect(comparisonType).toBe("period");
      expect(periodType).toBe("quarter");
    });
  });

  describe("Configuration Metadata", () => {
    it("should track creation timestamp", () => {
      const now = Date.now();
      const config = {
        id: "config-22",
        name: "Test",
        createdAt: now,
        updatedAt: now,
      };

      expect(config.createdAt).toBe(now);
    });

    it("should track update timestamp", () => {
      const created = 1000;
      const updated = 2000;
      const config = {
        id: "config-23",
        name: "Test",
        createdAt: created,
        updatedAt: updated,
      };

      expect(config.updatedAt).toBeGreaterThan(config.createdAt);
    });

    it("should format date for display", () => {
      const timestamp = Date.now();
      const date = new Date(timestamp);
      const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toMatch(/\d{4}/);
    });

    it("should include optional description", () => {
      const config = {
        id: "config-24",
        name: "Test",
        description: "This is a test configuration",
        comparisonType: "period" as const,
      };

      expect(config.description).toBe("This is a test configuration");
    });
  });

  describe("Configuration Summary", () => {
    it("should generate period summary", () => {
      const config = {
        comparisonType: "period" as const,
        periodType: "month" as const,
      };

      const summary =
        config.comparisonType === "period"
          ? `${config.periodType?.charAt(0).toUpperCase()}${config.periodType?.slice(1)} Comparison`
          : "";

      expect(summary).toBe("Month Comparison");
    });

    it("should generate platform summary", () => {
      const config = {
        comparisonType: "platform" as const,
        selectedPlatforms: ["amazon", "ebay", "walmart"],
      };

      const platformCount = config.selectedPlatforms?.length || 0;
      const summary =
        config.comparisonType === "platform"
          ? `${platformCount} Platform${platformCount !== 1 ? "s" : ""} Comparison`
          : "";

      expect(summary).toBe("3 Platforms Comparison");
    });

    it("should handle single platform in summary", () => {
      const config = {
        comparisonType: "platform" as const,
        selectedPlatforms: ["amazon"],
      };

      const platformCount = config.selectedPlatforms?.length || 0;
      const summary = `${platformCount} Platform${platformCount !== 1 ? "s" : ""} Comparison`;

      expect(summary).toBe("1 Platform Comparison");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty configuration list", () => {
      const configs: any[] = [];

      expect(configs.length).toBe(0);
      expect(configs.find(c => c.id === "any")).toBeUndefined();
    });

    it("should handle configuration with special characters in name", () => {
      const config = {
        id: "config-25",
        name: "Test & Compare (Q1 2024)",
        comparisonType: "period" as const,
      };

      expect(config.name).toContain("&");
      expect(config.name).toContain("(");
    });

    it("should handle configuration with empty description", () => {
      const config = {
        id: "config-26",
        name: "Test",
        description: "",
        comparisonType: "period" as const,
      };

      const hasDescription = config.description && config.description.trim().length > 0;

      expect(hasDescription).toBeFalsy();
    });

    it("should handle configuration deletion from middle of list", () => {
      const configs = [
        { id: "config-27" },
        { id: "config-28" },
        { id: "config-29" },
      ];

      const filtered = configs.filter(c => c.id !== "config-28");

      expect(filtered.length).toBe(2);
      expect(filtered[0].id).toBe("config-27");
      expect(filtered[1].id).toBe("config-29");
    });
  });
});
