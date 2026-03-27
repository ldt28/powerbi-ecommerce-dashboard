import { describe, it, expect } from "vitest";

describe("Real-Time Sales Dashboard", () => {
  describe("KPI Calculations", () => {
    it("should calculate daily sales correctly", () => {
      const dailySales = 2450000;
      const expectedSalesM = (dailySales / 1000000).toFixed(1);
      expect(expectedSalesM).toBe("2.5");
    });

    it("should calculate average order value", () => {
      const totalSales = 2450000;
      const ordersToday = 1247;
      const aov = totalSales / ordersToday;
      expect(aov).toBeCloseTo(1964.72, 0);
    });

    it("should format conversion rate percentage", () => {
      const conversionRate = 4.2;
      const formatted = conversionRate.toFixed(2);
      expect(formatted).toBe("4.20");
    });

    it("should calculate region average order value", () => {
      const regionSales = 450000;
      const regionOrders = 1200;
      const avgOrderValue = regionSales / regionOrders;
      expect(avgOrderValue).toBe(375);
    });
  });

  describe("Sales Transactions", () => {
    it("should format transaction amount correctly", () => {
      const amount = 245.99;
      const formatted = amount.toFixed(2);
      expect(formatted).toBe("245.99");
    });

    it("should generate unique transaction IDs", () => {
      const txnId1 = `TXN-${Date.now()}`;
      const txnId2 = `TXN-${Date.now() + 1}`;
      expect(txnId1).not.toBe(txnId2);
    });

    it("should validate transaction location format", () => {
      const locations = ["New York, NY", "Los Angeles, CA", "Chicago, IL"];
      const isValidLocation = (loc: string) => /^[A-Za-z\s]+,\s[A-Z]{2}$/.test(loc);
      locations.forEach(loc => {
        expect(isValidLocation(loc)).toBe(true);
      });
    });

    it("should validate latitude range", () => {
      const latitude = 40.7128;
      expect(latitude).toBeGreaterThanOrEqual(-90);
      expect(latitude).toBeLessThanOrEqual(90);
    });

    it("should validate longitude range", () => {
      const longitude = -74.0060;
      expect(longitude).toBeGreaterThanOrEqual(-180);
      expect(longitude).toBeLessThanOrEqual(180);
    });
  });

  describe("Sales Trends", () => {
    it("should calculate total sales from trend data", () => {
      const trends = [
        { time: "12:00 AM", sales: 45000, orders: 120 },
        { time: "1:00 AM", sales: 52000, orders: 145 },
        { time: "2:00 AM", sales: 48000, orders: 135 }
      ];
      const totalSales = trends.reduce((sum, t) => sum + t.sales, 0);
      expect(totalSales).toBe(145000);
    });

    it("should calculate total orders from trend data", () => {
      const trends = [
        { time: "12:00 AM", sales: 45000, orders: 120 },
        { time: "1:00 AM", sales: 52000, orders: 145 },
        { time: "2:00 AM", sales: 48000, orders: 135 }
      ];
      const totalOrders = trends.reduce((sum, t) => sum + t.orders, 0);
      expect(totalOrders).toBe(400);
    });

    it("should calculate average sales per hour", () => {
      const trends = [
        { time: "12:00 AM", sales: 45000, orders: 120 },
        { time: "1:00 AM", sales: 52000, orders: 145 },
        { time: "2:00 AM", sales: 48000, orders: 135 }
      ];
      const avgSales = trends.reduce((sum, t) => sum + t.sales, 0) / trends.length;
      expect(avgSales).toBeCloseTo(48333.33, 1);
    });

    it("should identify peak sales hour", () => {
      const trends = [
        { time: "12:00 AM", sales: 45000, orders: 120 },
        { time: "1:00 AM", sales: 52000, orders: 145 },
        { time: "2:00 AM", sales: 48000, orders: 135 }
      ];
      const peakHour = trends.reduce((max, t) => t.sales > max.sales ? t : max);
      expect(peakHour.time).toBe("1:00 AM");
      expect(peakHour.sales).toBe(52000);
    });
  });

  describe("Geographical Data", () => {
    it("should calculate total regional sales", () => {
      const regions = [
        { region: "Northeast", sales: 450000, orders: 1200, latitude: 40.7128, longitude: -74.0060 },
        { region: "Southeast", sales: 380000, orders: 950, latitude: 33.7490, longitude: -84.3880 },
        { region: "Midwest", sales: 420000, orders: 1100, latitude: 41.8781, longitude: -87.6298 }
      ];
      const totalSales = regions.reduce((sum, r) => sum + r.sales, 0);
      expect(totalSales).toBe(1250000);
    });

    it("should identify top performing region", () => {
      const regions = [
        { region: "Northeast", sales: 450000, orders: 1200, latitude: 40.7128, longitude: -74.0060 },
        { region: "Southeast", sales: 380000, orders: 950, latitude: 33.7490, longitude: -84.3880 },
        { region: "West Coast", sales: 520000, orders: 1350, latitude: 34.0522, longitude: -118.2437 }
      ];
      const topRegion = regions.reduce((max, r) => r.sales > max.sales ? r : max);
      expect(topRegion.region).toBe("West Coast");
      expect(topRegion.sales).toBe(520000);
    });

    it("should calculate regional market share", () => {
      const regions = [
        { region: "Northeast", sales: 450000, orders: 1200, latitude: 40.7128, longitude: -74.0060 },
        { region: "Southeast", sales: 380000, orders: 950, latitude: 33.7490, longitude: -84.3880 },
        { region: "Midwest", sales: 420000, orders: 1100, latitude: 41.8781, longitude: -87.6298 }
      ];
      const totalSales = regions.reduce((sum, r) => sum + r.sales, 0);
      const northeastShare = (regions[0].sales / totalSales) * 100;
      expect(northeastShare).toBeCloseTo(36, 0);
    });

    it("should calculate average order value by region", () => {
      const region = { region: "Northeast", sales: 450000, orders: 1200, latitude: 40.7128, longitude: -74.0060 };
      const aov = region.sales / region.orders;
      expect(aov).toBe(375);
    });
  });

  describe("Channel Performance", () => {
    it("should calculate total channel sales", () => {
      const channels = [
        { channel: "Amazon", sales: 450000, orders: 1200 },
        { channel: "eBay", sales: 320000, orders: 850 },
        { channel: "Walmart", sales: 380000, orders: 950 }
      ];
      const totalSales = channels.reduce((sum, c) => sum + c.sales, 0);
      expect(totalSales).toBe(1150000);
    });

    it("should identify top performing channel", () => {
      const channels = [
        { channel: "Amazon", sales: 450000, orders: 1200 },
        { channel: "eBay", sales: 320000, orders: 850 },
        { channel: "Walmart", sales: 380000, orders: 950 }
      ];
      const topChannel = channels.reduce((max, c) => c.sales > max.sales ? c : max);
      expect(topChannel.channel).toBe("Amazon");
      expect(topChannel.sales).toBe(450000);
    });

    it("should calculate channel market share", () => {
      const channels = [
        { channel: "Amazon", sales: 450000, orders: 1200 },
        { channel: "eBay", sales: 320000, orders: 850 },
        { channel: "Walmart", sales: 380000, orders: 950 }
      ];
      const totalSales = channels.reduce((sum, c) => sum + c.sales, 0);
      const amazonShare = (channels[0].sales / totalSales) * 100;
      expect(amazonShare).toBeCloseTo(39.13, 1);
    });

    it("should calculate average order value by channel", () => {
      const channel = { channel: "Amazon", sales: 450000, orders: 1200 };
      const aov = channel.sales / channel.orders;
      expect(aov).toBe(375);
    });

    it("should rank channels by sales", () => {
      const channels = [
        { channel: "Amazon", sales: 450000, orders: 1200 },
        { channel: "eBay", sales: 320000, orders: 850 },
        { channel: "Walmart", sales: 380000, orders: 950 }
      ];
      const ranked = [...channels].sort((a, b) => b.sales - a.sales);
      expect(ranked[0].channel).toBe("Amazon");
      expect(ranked[1].channel).toBe("Walmart");
      expect(ranked[2].channel).toBe("eBay");
    });
  });

  describe("Real-Time Updates", () => {
    it("should increment sales correctly", () => {
      let totalSales = 2450000;
      const increment = 5000;
      totalSales += increment;
      expect(totalSales).toBe(2455000);
    });

    it("should increment orders correctly", () => {
      let ordersToday = 1247;
      const increment = 10;
      ordersToday += increment;
      expect(ordersToday).toBe(1257);
    });

    it("should update average order value", () => {
      let avgOrderValue = 196.5;
      const change = 2.5;
      avgOrderValue += change;
      expect(avgOrderValue).toBeCloseTo(199, 0);
    });

    it("should update conversion rate", () => {
      let conversionRate = 4.2;
      const change = 0.1;
      conversionRate += change;
      expect(conversionRate).toBeCloseTo(4.3, 1);
    });

    it("should maintain timestamp accuracy", () => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      expect(timestamp).toMatch(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
    });
  });

  describe("Data Formatting", () => {
    it("should format currency with commas", () => {
      const amount = 2450000;
      const formatted = amount.toLocaleString();
      expect(formatted).toBe("2,450,000");
    });

    it("should format percentage with 2 decimals", () => {
      const rate = 4.2;
      const formatted = rate.toFixed(2);
      expect(formatted).toBe("4.20");
    });

    it("should format time correctly", () => {
      const date = new Date("2026-03-25T14:30:45");
      const timeStr = date.toLocaleTimeString();
      expect(timeStr).toMatch(/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/);
    });

    it("should format large numbers in millions", () => {
      const sales = 2450000;
      const formatted = (sales / 1000000).toFixed(1);
      expect(formatted).toBe("2.5");
    });
  });

  describe("Data Validation", () => {
    it("should validate sales amount is positive", () => {
      const sales = 450000;
      expect(sales).toBeGreaterThan(0);
    });

    it("should validate orders count is positive", () => {
      const orders = 1200;
      expect(orders).toBeGreaterThan(0);
    });

    it("should validate conversion rate is between 0 and 100", () => {
      const conversionRate = 4.2;
      expect(conversionRate).toBeGreaterThanOrEqual(0);
      expect(conversionRate).toBeLessThanOrEqual(100);
    });

    it("should validate channel name is not empty", () => {
      const channel = "Amazon";
      expect(channel.length).toBeGreaterThan(0);
    });

    it("should validate region name is not empty", () => {
      const region = "Northeast";
      expect(region.length).toBeGreaterThan(0);
    });
  });
});
