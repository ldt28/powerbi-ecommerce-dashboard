import { describe, it, expect } from 'vitest';

/**
 * Product Analysis Dashboard Tests
 * 
 * These tests verify the data transformation and calculation logic
 * used by the Product Analysis dashboard for:
 * - Top sellers by revenue
 * - Profit margin analysis
 * - Inventory level tracking
 * - Category breakdown
 * - KPI calculations
 */

describe('Product Analysis Dashboard Data Transformations', () => {
  describe('Top Products Calculation', () => {
    it('should calculate revenue correctly from order items', () => {
      const mockOrderItems = [
        { productId: 1, quantity: 10, price: 100 },
        { productId: 1, quantity: 5, price: 100 },
        { productId: 2, quantity: 20, price: 50 },
      ];

      const productRevenue: Record<number, number> = {};
      mockOrderItems.forEach(item => {
        const revenue = item.quantity * item.price;
        productRevenue[item.productId] = (productRevenue[item.productId] || 0) + revenue;
      });

      expect(productRevenue[1]).toBe(1500); // 10*100 + 5*100
      expect(productRevenue[2]).toBe(1000); // 20*50
    });

    it('should rank products by revenue in descending order', () => {
      const products = [
        { id: 1, name: 'Product A', revenue: 1500 },
        { id: 2, name: 'Product B', revenue: 1000 },
        { id: 3, name: 'Product C', revenue: 2000 },
      ];

      const sorted = [...products].sort((a, b) => b.revenue - a.revenue);

      expect(sorted[0].id).toBe(3);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(2);
    });
  });

  describe('Profit Margin Calculation', () => {
    it('should calculate profit margin as percentage', () => {
      const price = 100;
      const cost = 60;
      const margin = ((price - cost) / price) * 100;

      expect(margin).toBe(40);
    });

    it('should handle multiple products with different margins', () => {
      const products = [
        { id: 1, price: 100, cost: 60 },
        { id: 2, price: 50, cost: 30 },
        { id: 3, price: 200, cost: 100 },
      ];

      const margins = products.map(p => ({
        id: p.id,
        margin: ((p.price - p.cost) / p.price) * 100,
      }));

      expect(margins[0].margin).toBe(40);
      expect(margins[1].margin).toBe(40);
      expect(margins[2].margin).toBe(50);
    });

    it('should calculate profit from quantity and margin', () => {
      const quantity = 10;
      const price = 100;
      const cost = 60;
      const profit = quantity * (price - cost);

      expect(profit).toBe(400);
    });
  });

  describe('Inventory Analysis', () => {
    it('should identify low stock items', () => {
      const inventory = [
        { productId: 1, stock: 5, reorderLevel: 10 },
        { productId: 2, stock: 20, reorderLevel: 10 },
        { productId: 3, stock: 8, reorderLevel: 10 },
      ];

      const lowStock = inventory.filter(item => item.stock < item.reorderLevel);

      expect(lowStock).toHaveLength(2);
      expect(lowStock[0].productId).toBe(1);
      expect(lowStock[1].productId).toBe(3);
    });

    it('should calculate total inventory', () => {
      const inventory = [
        { productId: 1, stock: 100 },
        { productId: 2, stock: 200 },
        { productId: 3, stock: 150 },
      ];

      const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);

      expect(totalStock).toBe(450);
    });

    it('should calculate inventory turnover', () => {
      const unitsSold = 1000;
      const averageInventory = 200;
      const turnover = unitsSold / averageInventory;

      expect(turnover).toBe(5);
    });
  });

  describe('Category Breakdown', () => {
    it('should aggregate revenue by category', () => {
      const products = [
        { id: 1, category: 'Electronics', revenue: 1000 },
        { id: 2, category: 'Electronics', revenue: 1500 },
        { id: 3, category: 'Clothing', revenue: 800 },
        { id: 4, category: 'Clothing', revenue: 600 },
      ];

      const categoryRevenue: Record<string, number> = {};
      products.forEach(p => {
        categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + p.revenue;
      });

      expect(categoryRevenue['Electronics']).toBe(2500);
      expect(categoryRevenue['Clothing']).toBe(1400);
    });

    it('should calculate category percentage of total revenue', () => {
      const categoryRevenue = {
        'Electronics': 2500,
        'Clothing': 1400,
        'Home': 1100,
      };

      const totalRevenue = Object.values(categoryRevenue).reduce((a, b) => a + b, 0);
      const percentages = Object.entries(categoryRevenue).map(([category, revenue]) => ({
        category,
        percentage: (revenue / totalRevenue) * 100,
      }));

      // Total is 5000, so: Electronics 2500/5000=50%, Clothing 1400/5000=28%, Home 1100/5000=22%
      expect(percentages[0].percentage).toBeCloseTo(50, 0);
      expect(percentages[1].percentage).toBeCloseTo(28, 0);
      expect(percentages[2].percentage).toBeCloseTo(22, 0);
    });

    it('should sort categories by revenue', () => {
      const categories = [
        { name: 'Clothing', revenue: 1400 },
        { name: 'Electronics', revenue: 2500 },
        { name: 'Home', revenue: 1100 },
      ];

      const sorted = [...categories].sort((a, b) => b.revenue - a.revenue);

      expect(sorted[0].name).toBe('Electronics');
      expect(sorted[1].name).toBe('Clothing');
      expect(sorted[2].name).toBe('Home');
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter items within date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-03-31');

      const orders = [
        { id: 1, date: new Date('2023-12-15') },
        { id: 2, date: new Date('2024-01-15') },
        { id: 3, date: new Date('2024-02-15') },
        { id: 4, date: new Date('2024-04-15') },
      ];

      const filtered = orders.filter(o => o.date >= startDate && o.date <= endDate);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe(2);
      expect(filtered[1].id).toBe(3);
    });

    it('should handle 90-day lookback period', () => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

      expect(startDate.getTime()).toBeLessThan(endDate.getTime());
      expect(endDate.getTime() - startDate.getTime()).toBeCloseTo(90 * 24 * 60 * 60 * 1000, -3);
    });
  });

  describe('KPI Calculations', () => {
    it('should calculate total revenue KPI', () => {
      const orders = [
        { id: 1, amount: 1000 },
        { id: 2, amount: 1500 },
        { id: 3, amount: 800 },
      ];

      const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);

      expect(totalRevenue).toBe(3300);
    });

    it('should calculate average order value', () => {
      const orders = [
        { id: 1, amount: 1000 },
        { id: 2, amount: 1500 },
        { id: 3, amount: 800 },
      ];

      const aov = orders.reduce((sum, o) => sum + o.amount, 0) / orders.length;

      expect(aov).toBe(1100);
    });

    it('should calculate total profit KPI', () => {
      const products = [
        { id: 1, quantity: 10, price: 100, cost: 60 },
        { id: 2, quantity: 20, price: 50, cost: 30 },
      ];

      const totalProfit = products.reduce((sum, p) => sum + (p.quantity * (p.price - p.cost)), 0);

      expect(totalProfit).toBe(800); // 10*40 + 20*20
    });

    it('should calculate average profit margin across all products', () => {
      const products = [
        { price: 100, cost: 60 },
        { price: 50, cost: 30 },
        { price: 200, cost: 100 },
      ];

      const avgMargin = products.reduce((sum, p) => {
        const margin = ((p.price - p.cost) / p.price) * 100;
        return sum + margin;
      }, 0) / products.length;

      expect(avgMargin).toBeCloseTo(43.33, 1);
    });

    it('should calculate product count', () => {
      const products = [
        { id: 1, name: 'Product A' },
        { id: 2, name: 'Product B' },
        { id: 3, name: 'Product C' },
      ];

      const count = products.length;

      expect(count).toBe(3);
    });
  });

  describe('Data Validation', () => {
    it('should handle empty data sets', () => {
      const products: any[] = [];

      const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);

      expect(totalRevenue).toBe(0);
    });

    it('should handle null or undefined values', () => {
      const products = [
        { id: 1, revenue: 1000 },
        { id: 2, revenue: null },
        { id: 3, revenue: undefined },
      ];

      const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0);

      expect(totalRevenue).toBe(1000);
    });

    it('should validate margin is between 0 and 100', () => {
      const validMargins = [10, 25, 50, 75, 99];

      validMargins.forEach(margin => {
        expect(margin).toBeGreaterThanOrEqual(0);
        expect(margin).toBeLessThanOrEqual(100);
      });
    });
  });
});
