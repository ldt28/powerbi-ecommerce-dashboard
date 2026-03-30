import { describe, it, expect, beforeEach } from "vitest";

/**
 * Tests for Drill-Down Navigation Functionality
 */

describe("Drill-Down Navigation", () => {
  interface DrilldownLevel {
    id: string;
    title: string;
    type: "summary" | "category" | "detail";
    data?: Record<string, any>;
    breadcrumbLabel: string;
  }

  class DrilldownNavigator {
    private levels: DrilldownLevel[] = [];
    private currentIndex: number = -1;

    get currentLevel(): DrilldownLevel | null {
      return this.currentIndex >= 0 ? this.levels[this.currentIndex] : null;
    }

    get canGoBack(): boolean {
      return this.currentIndex > 0;
    }

    get canGoForward(): boolean {
      return this.currentIndex < this.levels.length - 1;
    }

    drillDown(level: DrilldownLevel): void {
      this.levels = this.levels.slice(0, this.currentIndex + 1);
      this.levels.push(level);
      this.currentIndex++;
    }

    goBack(): void {
      if (this.canGoBack) {
        this.currentIndex--;
      }
    }

    goForward(): void {
      if (this.canGoForward) {
        this.currentIndex++;
      }
    }

    reset(): void {
      this.levels = [];
      this.currentIndex = -1;
    }

    getBreadcrumbs(): DrilldownLevel[] {
      return this.levels.slice(0, this.currentIndex + 1);
    }

    getDepth(): number {
      return this.currentIndex + 1;
    }
  }

  let navigator: DrilldownNavigator;

  beforeEach(() => {
    navigator = new DrilldownNavigator();
  });

  describe("Basic Navigation", () => {
    it("should start with no levels", () => {
      expect(navigator.currentLevel).toBeNull();
      expect(navigator.getDepth()).toBe(0);
    });

    it("should drill down to first level", () => {
      const level: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };

      navigator.drillDown(level);

      expect(navigator.currentLevel).toEqual(level);
      expect(navigator.getDepth()).toBe(1);
    });

    it("should drill down multiple levels", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };
      const level3: DrilldownLevel = {
        id: "product",
        title: "Laptop",
        type: "detail",
        breadcrumbLabel: "Laptop",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);
      navigator.drillDown(level3);

      expect(navigator.getDepth()).toBe(3);
      expect(navigator.currentLevel?.id).toBe("product");
    });
  });

  describe("Back/Forward Navigation", () => {
    it("should not allow going back from root", () => {
      expect(navigator.canGoBack).toBe(false);
      navigator.goBack();
      expect(navigator.currentLevel).toBeNull();
    });

    it("should allow going back after drilling down", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);

      expect(navigator.canGoBack).toBe(true);
      navigator.goBack();

      expect(navigator.currentLevel?.id).toBe("summary");
      expect(navigator.getDepth()).toBe(1);
    });

    it("should not allow going forward from latest level", () => {
      const level: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };

      navigator.drillDown(level);

      expect(navigator.canGoForward).toBe(false);
      navigator.goForward();
      expect(navigator.currentLevel?.id).toBe("summary");
    });

    it("should allow going forward after going back", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);
      navigator.goBack();

      expect(navigator.canGoForward).toBe(true);
      navigator.goForward();

      expect(navigator.currentLevel?.id).toBe("category");
    });

    it("should clear forward history when drilling down after going back", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category1",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };
      const level3: DrilldownLevel = {
        id: "category2",
        title: "Clothing",
        type: "category",
        breadcrumbLabel: "Clothing",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);
      navigator.goBack();
      navigator.drillDown(level3);

      expect(navigator.canGoForward).toBe(false);
      expect(navigator.currentLevel?.id).toBe("category2");
    });
  });

  describe("Breadcrumb Navigation", () => {
    it("should return empty breadcrumbs at root", () => {
      const breadcrumbs = navigator.getBreadcrumbs();
      expect(breadcrumbs).toEqual([]);
    });

    it("should return breadcrumbs for current path", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);

      const breadcrumbs = navigator.getBreadcrumbs();
      expect(breadcrumbs.length).toBe(2);
      expect(breadcrumbs[0].id).toBe("summary");
      expect(breadcrumbs[1].id).toBe("category");
    });

    it("should update breadcrumbs when navigating back", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);
      navigator.goBack();

      const breadcrumbs = navigator.getBreadcrumbs();
      expect(breadcrumbs.length).toBe(1);
      expect(breadcrumbs[0].id).toBe("summary");
    });
  });

  describe("Reset Functionality", () => {
    it("should reset to root state", () => {
      const level: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };

      navigator.drillDown(level);
      navigator.reset();

      expect(navigator.currentLevel).toBeNull();
      expect(navigator.getDepth()).toBe(0);
      expect(navigator.getBreadcrumbs()).toEqual([]);
    });

    it("should allow drilling down after reset", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };

      navigator.drillDown(level1);
      navigator.reset();
      navigator.drillDown(level2);

      expect(navigator.currentLevel?.id).toBe("category");
      expect(navigator.getDepth()).toBe(1);
    });
  });

  describe("Data Preservation", () => {
    it("should preserve data in drill-down levels", () => {
      const level: DrilldownLevel = {
        id: "product",
        title: "Laptop",
        type: "detail",
        data: { price: 999, stock: 50 },
        breadcrumbLabel: "Laptop",
      };

      navigator.drillDown(level);

      expect(navigator.currentLevel?.data).toEqual({ price: 999, stock: 50 });
    });

    it("should maintain data across navigation", () => {
      const level1: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        data: { count: 100 },
        breadcrumbLabel: "Electronics",
      };
      const level2: DrilldownLevel = {
        id: "product",
        title: "Laptop",
        type: "detail",
        data: { price: 999 },
        breadcrumbLabel: "Laptop",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);
      navigator.goBack();

      expect(navigator.currentLevel?.data).toEqual({ count: 100 });
    });
  });

  describe("Complex Navigation Scenarios", () => {
    it("should handle deep drill-down sequences", () => {
      const levels: DrilldownLevel[] = Array.from({ length: 5 }, (_, i) => ({
        id: `level-${i}`,
        title: `Level ${i}`,
        type: i === 0 ? "summary" : i === 4 ? "detail" : "category",
        breadcrumbLabel: `Level ${i}`,
      }));

      levels.forEach((level) => navigator.drillDown(level));

      expect(navigator.getDepth()).toBe(5);
      expect(navigator.currentLevel?.id).toBe("level-4");

      // Navigate back to middle level
      navigator.goBack();
      navigator.goBack();
      expect(navigator.currentLevel?.id).toBe("level-2");
      expect(navigator.canGoBack).toBe(true);
      expect(navigator.canGoForward).toBe(true);
    });

    it("should handle multiple drill-down and back sequences", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };
      const level3: DrilldownLevel = {
        id: "product",
        title: "Laptop",
        type: "detail",
        breadcrumbLabel: "Laptop",
      };

      // Drill down
      navigator.drillDown(level1);
      navigator.drillDown(level2);
      navigator.drillDown(level3);
      expect(navigator.getDepth()).toBe(3);

      // Go back twice
      navigator.goBack();
      navigator.goBack();
      expect(navigator.getDepth()).toBe(1);

      // Go forward once
      navigator.goForward();
      expect(navigator.getDepth()).toBe(2);

      // Drill down again
      navigator.drillDown(level3);
      expect(navigator.getDepth()).toBe(3);
    });
  });

  describe("Performance", () => {
    it("should handle large drill-down depths efficiently", () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        const level: DrilldownLevel = {
          id: `level-${i}`,
          title: `Level ${i}`,
          type: "category",
          breadcrumbLabel: `Level ${i}`,
        };
        navigator.drillDown(level);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(navigator.getDepth()).toBe(100);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it("should handle rapid back/forward navigation", () => {
      const level1: DrilldownLevel = {
        id: "summary",
        title: "Summary",
        type: "summary",
        breadcrumbLabel: "Summary",
      };
      const level2: DrilldownLevel = {
        id: "category",
        title: "Electronics",
        type: "category",
        breadcrumbLabel: "Electronics",
      };

      navigator.drillDown(level1);
      navigator.drillDown(level2);

      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        if (i % 2 === 0) {
          navigator.goBack();
        } else {
          navigator.goForward();
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });
  });
});
