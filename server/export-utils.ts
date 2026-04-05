/**
 * Export Utilities for PDF and Excel generation
 */

export interface ExportData {
  title: string;
  dateRange?: string;
  metrics: Record<string, string | number>;
  tables?: Array<{
    name: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
}

/**
 * Convert array of objects to CSV format
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map(h => `"${h}"`).join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '""';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Transform revenue data for export
 */
export function transformRevenueData(data: any) {
  return {
    kpis: {
      'Total Revenue': data.totalRevenue,
      'Total Orders': data.totalOrders,
      'Conversion Rate': data.conversionRate,
      'Avg Order Value': data.avgOrderValue,
      'MoM Growth': data.momGrowth,
    },
    tables: [],
  };
}

/**
 * Transform marketing data for export
 */
export function transformMarketingData(data: any) {
  return {
    kpis: {
      'Total Ad Spend': data.totalAdSpend,
      'Total Revenue': data.totalRevenue,
      'ROAS': data.roas,
      'CPA': data.cpa,
      'Conversion Rate': data.conversionRate,
    },
    tables: [],
  };
}

/**
 * Generate CSV content from export data
 */
export function generateCSVContent(data: ExportData): string {
  let csv = '';

  // Add title
  csv += `${data.title}\n`;

  // Add date range if provided
  if (data.dateRange) {
    csv += `Date Range,${data.dateRange}\n`;
  }

  csv += '\n';

  // Add metrics section
  csv += 'Key Metrics\n';
  Object.entries(data.metrics).forEach(([key, value]) => {
    csv += `"${key}","${value}"\n`;
  });

  // Add tables if provided
  if (data.tables && data.tables.length > 0) {
    csv += '\n';
    data.tables.forEach(table => {
      csv += `\n${table.name}\n`;
      csv += table.headers.map(h => `"${h}"`).join(',') + '\n';
      table.rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
    });
  }

  return csv;
}

/**
 * Export marketplace comparison data to CSV
 */
export function exportMarketplaceComparisonToCSV(
  platforms: Array<{
    name: string;
    metrics: Record<string, string | number>;
  }>,
  dateRange: string
): string {
  let csv = '';

  // Add title and date range
  csv += 'Marketplace Comparison Report\n';
  csv += `Date Range,${dateRange}\n\n`;

  // Add comparison table
  const allMetrics = platforms.length > 0 ? Object.keys(platforms[0].metrics) : [];
  const platformNames = platforms.map(p => p.name);

  csv += 'Metric,' + platformNames.map(p => `"${p}"`).join(',') + '\n';

  allMetrics.forEach(metric => {
    csv += `"${metric}"`;
    platforms.forEach(platform => {
      csv += `,"${platform.metrics[metric]}"`;
    });
    csv += '\n';
  });

  // Add individual platform sections
  csv += '\n\nDetailed Platform Metrics\n';
  platforms.forEach(platform => {
    csv += `\n${platform.name}\n`;
    csv += 'Metric,Value\n';
    Object.entries(platform.metrics).forEach(([key, value]) => {
      csv += `"${key}","${value}"\n`;
    });
  });

  return csv;
}

/**
 * Format data for Excel export (returns array of arrays)
 */
export function formatDataForExcel(data: ExportData): (string | number)[][] {
  const result: (string | number)[][] = [];

  // Add title
  result.push([data.title]);
  result.push([]);

  // Add date range if provided
  if (data.dateRange) {
    result.push(['Date Range', data.dateRange]);
  }

  // Add metrics section
  result.push(['Key Metrics']);
  Object.entries(data.metrics).forEach(([key, value]) => {
    result.push([key, value]);
  });

  // Add tables if provided
  if (data.tables && data.tables.length > 0) {
    data.tables.forEach(table => {
      result.push([]);
      result.push([table.name]);
      result.push(table.headers);
      table.rows.forEach(row => {
        result.push(row);
      });
    });
  }

  return result;
}

/**
 * Format marketplace comparison data for Excel export
 */
export function formatMarketplaceComparisonForExcel(
  platforms: Array<{
    name: string;
    metrics: Record<string, string | number>;
  }>,
  dateRange: string
): (string | number)[][] {
  const result: (string | number)[][] = [];

  // Add title and date range
  result.push(['Marketplace Comparison Report']);
  result.push(['Date Range', dateRange]);
  result.push([]);

  // Add comparison table
  const allMetrics = platforms.length > 0 ? Object.keys(platforms[0].metrics) : [];
  const platformNames = platforms.map(p => p.name);

  result.push(['Metric', ...platformNames]);

  allMetrics.forEach(metric => {
    result.push([
      metric,
      ...platforms.map(p => p.metrics[metric]),
    ]);
  });

  // Add individual platform sections
  result.push([]);
  result.push(['Detailed Platform Metrics']);

  platforms.forEach(platform => {
    result.push([]);
    result.push([platform.name]);
    result.push(['Metric', 'Value']);
    Object.entries(platform.metrics).forEach(([key, value]) => {
      result.push([key, value]);
    });
  });

  return result;
}
