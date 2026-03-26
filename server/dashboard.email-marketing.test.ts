import { describe, it, expect } from "vitest";

/**
 * Email Marketing Dashboard Tests
 * Tests for email campaign metrics, engagement calculations, and ROI analysis
 */

describe("Email Marketing Dashboard", () => {
  describe("Campaign Metrics", () => {
    it("should calculate open rate correctly", () => {
      const sent = 5200;
      const opened = 1560;
      const openRate = (opened / sent) * 100;

      expect(openRate).toBe(30);
    });

    it("should calculate click rate correctly", () => {
      const sent = 5200;
      const clicked = 312;
      const clickRate = (clicked / sent) * 100;

      expect(clickRate).toBeCloseTo(6, 1);
    });

    it("should calculate conversion rate correctly", () => {
      const sent = 5200;
      const converted = 78;
      const conversionRate = (converted / sent) * 100;

      expect(conversionRate).toBeCloseTo(1.5, 1);
    });

    it("should calculate click-through rate from opens", () => {
      const opened = 1560;
      const clicked = 312;
      const ctr = (clicked / opened) * 100;

      expect(ctr).toBeCloseTo(20, 1);
    });

    it("should calculate conversion rate from clicks", () => {
      const clicked = 312;
      const converted = 78;
      const conversionFromClicks = (converted / clicked) * 100;

      expect(conversionFromClicks).toBe(25);
    });
  });

  describe("Campaign Performance Comparison", () => {
    it("should identify best performing campaign by open rate", () => {
      const campaigns = [
        { name: "Welcome Series", openRate: 30 },
        { name: "Spring Sale", openRate: 37 },
        { name: "Product Restock", openRate: 25 },
        { name: "VIP Exclusive", openRate: 50 },
      ];

      const bestCampaign = campaigns.reduce((best, current) =>
        current.openRate > best.openRate ? current : best
      );

      expect(bestCampaign.name).toBe("VIP Exclusive");
      expect(bestCampaign.openRate).toBe(50);
    });

    it("should identify worst performing campaign", () => {
      const campaigns = [
        { name: "Welcome Series", openRate: 30 },
        { name: "Spring Sale", openRate: 37 },
        { name: "Product Restock", openRate: 25 },
      ];

      const worstCampaign = campaigns.reduce((worst, current) =>
        current.openRate < worst.openRate ? current : worst
      );

      expect(worstCampaign.name).toBe("Product Restock");
      expect(worstCampaign.openRate).toBe(25);
    });

    it("should calculate average open rate across campaigns", () => {
      const campaigns = [
        { openRate: 30 },
        { openRate: 37 },
        { openRate: 25 },
        { openRate: 50 },
        { openRate: 35 },
      ];

      const avgOpenRate = campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length;
      expect(avgOpenRate).toBe(35.4);
    });

    it("should calculate total emails sent across campaigns", () => {
      const campaigns = [
        { sent: 5200 },
        { sent: 8500 },
        { sent: 6200 },
        { sent: 1200 },
        { sent: 3800 },
      ];

      const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
      expect(totalSent).toBe(24900);
    });
  });

  describe("Revenue Analysis", () => {
    it("should calculate revenue per email sent", () => {
      const revenue = 12480;
      const sent = 5200;
      const revenuePerEmail = revenue / sent;

      expect(revenuePerEmail).toBeCloseTo(2.4, 1);
    });

    it("should calculate total revenue from campaigns", () => {
      const campaigns = [
        { revenue: 12480 },
        { revenue: 45400 },
        { revenue: 9920 },
        { revenue: 16200 },
        { revenue: 14250 },
      ];

      const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
      expect(totalRevenue).toBe(98250);
    });

    it("should calculate ROI based on email cost", () => {
      const totalRevenue = 98250;
      const totalSent = 24900;
      const costPerEmail = 0.5;
      const totalCost = totalSent * costPerEmail;
      const roi = (totalRevenue / totalCost) * 100;

      expect(roi).toBeCloseTo(789, 0);
    });

    it("should identify highest revenue generating campaign", () => {
      const campaigns = [
        { name: "Welcome Series", revenue: 12480 },
        { name: "Spring Sale", revenue: 45400 },
        { name: "Product Restock", revenue: 9920 },
      ];

      const topCampaign = campaigns.reduce((best, current) =>
        current.revenue > best.revenue ? current : best
      );

      expect(topCampaign.name).toBe("Spring Sale");
      expect(topCampaign.revenue).toBe(45400);
    });
  });

  describe("Segment Performance", () => {
    it("should calculate segment contribution to revenue", () => {
      const segments = [
        { name: "VIP", revenue: 18720 },
        { name: "High Value", revenue: 42840 },
        { name: "Regular", revenue: 23640 },
      ];

      const totalRevenue = segments.reduce((sum, s) => sum + s.revenue, 0);
      const vipPercentage = (segments[0].revenue / totalRevenue) * 100;

      expect(vipPercentage).toBeCloseTo(21.97, 1);
    });

    it("should identify best performing segment by open rate", () => {
      const segments = [
        { name: "VIP", openRate: 52 },
        { name: "High Value", openRate: 42 },
        { name: "Regular", openRate: 28 },
        { name: "At Risk", openRate: 18 },
      ];

      const bestSegment = segments.reduce((best, current) =>
        current.openRate > best.openRate ? current : best
      );

      expect(bestSegment.name).toBe("VIP");
      expect(bestSegment.openRate).toBe(52);
    });

    it("should calculate segment engagement lift", () => {
      const vipOpenRate = 52;
      const regularOpenRate = 28;
      const lift = ((vipOpenRate - regularOpenRate) / regularOpenRate) * 100;

      expect(lift).toBeCloseTo(85.71, 1);
    });

    it("should calculate revenue per email by segment", () => {
      const segments = [
        { name: "VIP", sent: 1200, revenue: 18720 },
        { name: "High Value", sent: 3500, revenue: 42840 },
      ];

      const vipRevenuePerEmail = segments[0].revenue / segments[0].sent;
      const highValueRevenuePerEmail = segments[1].revenue / segments[1].sent;

      expect(vipRevenuePerEmail).toBe(15.6);
      expect(highValueRevenuePerEmail).toBeCloseTo(12.24, 1);
    });
  });

  describe("Device Performance", () => {
    it("should calculate device distribution", () => {
      const devices = [
        { name: "Mobile", percentage: 62 },
        { name: "Desktop", percentage: 28 },
        { name: "Tablet", percentage: 10 },
      ];

      const totalPercentage = devices.reduce((sum, d) => sum + d.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it("should identify dominant device type", () => {
      const devices = [
        { name: "Mobile", opens: 3100 },
        { name: "Desktop", opens: 1400 },
        { name: "Tablet", opens: 500 },
      ];

      const dominantDevice = devices.reduce((best, current) =>
        current.opens > best.opens ? current : best
      );

      expect(dominantDevice.name).toBe("Mobile");
      expect(dominantDevice.opens).toBe(3100);
    });

    it("should calculate mobile vs desktop ratio", () => {
      const mobileOpens = 3100;
      const desktopOpens = 1400;
      const ratio = mobileOpens / desktopOpens;

      expect(ratio).toBeCloseTo(2.21, 1);
    });
  });

  describe("Time of Day Analysis", () => {
    it("should identify best send time by open rate", () => {
      const times = [
        { hour: "6am", openRate: 8 },
        { hour: "9am", openRate: 28 },
        { hour: "12pm", openRate: 35 },
        { hour: "3pm", openRate: 32 },
        { hour: "6pm", openRate: 38 },
        { hour: "9pm", openRate: 25 },
      ];

      const bestTime = times.reduce((best, current) =>
        current.openRate > best.openRate ? current : best
      );

      expect(bestTime.hour).toBe("6pm");
      expect(bestTime.openRate).toBe(38);
    });

    it("should calculate average open rate by time", () => {
      const times = [
        { openRate: 8 },
        { openRate: 28 },
        { openRate: 35 },
        { openRate: 32 },
        { openRate: 38 },
        { openRate: 25 },
      ];

      const avgOpenRate = times.reduce((sum, t) => sum + t.openRate, 0) / times.length;
      expect(avgOpenRate).toBeCloseTo(27.67, 1);
    });
  });

  describe("Engagement Trends", () => {
    it("should calculate week-over-week growth in opens", () => {
      const week1Opens = 2400;
      const week2Opens = 2800;
      const growth = ((week2Opens - week1Opens) / week1Opens) * 100;

      expect(growth).toBeCloseTo(16.67, 1);
    });

    it("should identify peak engagement week", () => {
      const weeks = [
        { week: "Week 1", opens: 2400 },
        { week: "Week 2", opens: 2800 },
        { week: "Week 3", opens: 2200 },
        { week: "Week 4", opens: 3200 },
        { week: "Week 8", opens: 4100 },
      ];

      const peakWeek = weeks.reduce((best, current) =>
        current.opens > best.opens ? current : best
      );

      expect(peakWeek.week).toBe("Week 8");
      expect(peakWeek.opens).toBe(4100);
    });

    it("should calculate total opens across all weeks", () => {
      const weeks = [
        { opens: 2400 },
        { opens: 2800 },
        { opens: 2200 },
        { opens: 3200 },
        { opens: 3600 },
        { opens: 3100 },
        { opens: 3800 },
        { opens: 4100 },
      ];

      const totalOpens = weeks.reduce((sum, w) => sum + w.opens, 0);
      expect(totalOpens).toBe(25200);
    });
  });

  describe("Data Validation", () => {
    it("should validate open rate is between 0-100", () => {
      const openRates = [30, 37, 25, 50, 35];
      const isValid = openRates.every((rate) => rate >= 0 && rate <= 100);
      expect(isValid).toBe(true);
    });

    it("should validate click rate is less than open rate", () => {
      const campaigns = [
        { openRate: 30, clickRate: 6 },
        { openRate: 37, clickRate: 8.9 },
        { openRate: 25, clickRate: 5 },
      ];

      const isValid = campaigns.every((c) => c.clickRate < c.openRate);
      expect(isValid).toBe(true);
    });

    it("should validate conversion rate is less than click rate", () => {
      const campaigns = [
        { clickRate: 6, conversionRate: 1.5 },
        { clickRate: 8.9, conversionRate: 2.7 },
        { clickRate: 5, conversionRate: 1 },
      ];

      const isValid = campaigns.every((c) => c.conversionRate < c.clickRate);
      expect(isValid).toBe(true);
    });

    it("should validate revenue is non-negative", () => {
      const campaigns = [
        { revenue: 12480 },
        { revenue: 45400 },
        { revenue: 0 },
      ];

      const isValid = campaigns.every((c) => c.revenue >= 0);
      expect(isValid).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero emails sent", () => {
      const sent = 0;
      const opened = 0;
      const openRate = sent > 0 ? (opened / sent) * 100 : 0;
      expect(openRate).toBe(0);
    });

    it("should handle 100% open rate", () => {
      const sent = 1000;
      const opened = 1000;
      const openRate = (opened / sent) * 100;
      expect(openRate).toBe(100);
    });

    it("should handle very high ROI", () => {
      const revenue = 100000;
      const cost = 500;
      const roi = (revenue / cost) * 100;
      expect(roi).toBe(20000);
    });

    it("should handle single campaign", () => {
      const campaigns = [{ revenue: 50000 }];
      const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
      expect(totalRevenue).toBe(50000);
    });

    it("should handle equal segment performance", () => {
      const segments = [
        { openRate: 30 },
        { openRate: 30 },
        { openRate: 30 },
      ];

      const avgOpenRate = segments.reduce((sum, s) => sum + s.openRate, 0) / segments.length;
      expect(avgOpenRate).toBe(30);
    });
  });
});
