/**
 * Export Utilities
 * Functions for exporting dashboard data to CSV and PDF formats
 */

/**
 * Convert array of objects to CSV format
 */
export function convertToCSV(data: Record<string, any>[], filename: string): string {
  if (!data || data.length === 0) {
    return "";
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV header row
  const csvHeaders = headers.map((header) => `"${header}"`).join(",");

  // Create CSV data rows
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '""';
        }
        // Handle strings with commas or quotes
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        // Handle numbers and booleans
        return `"${value}"`;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(data: Record<string, any>[], filename: string): void {
  const csv = convertToCSV(data, filename);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate PDF from HTML content
 * Uses browser's print functionality to generate PDF
 */
export function generatePDFFromHTML(content: string, filename: string): void {
  const printWindow = window.open("", "", "height=600,width=800");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #1f2937;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
          }
          h2 {
            color: #374151;
            margin-top: 20px;
            font-size: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th {
            background-color: #3b82f6;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            border: 1px solid #e5e7eb;
            padding: 8px;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .kpi-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
          }
          .kpi-card {
            border: 1px solid #e5e7eb;
            padding: 15px;
            border-radius: 5px;
            background-color: #f3f4f6;
          }
          .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          .kpi-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${content}
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

/**
 * Generate PDF content for dashboard data
 */
export function generateDashboardPDF(
  title: string,
  dateRange: { from: Date; to: Date },
  kpis: Record<string, string | number>,
  tables: Array<{ title: string; data: Record<string, any>[] }>
): string {
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  let content = `
    <h1>${title}</h1>
    <p><strong>Report Period:</strong> ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}</p>
  `;

  // Add KPI section
  if (Object.keys(kpis).length > 0) {
    content += '<h2>Key Performance Indicators</h2><div class="kpi-section">';
    Object.entries(kpis).forEach(([label, value]) => {
      content += `
        <div class="kpi-card">
          <div class="kpi-value">${value}</div>
          <div class="kpi-label">${label}</div>
        </div>
      `;
    });
    content += "</div>";
  }

  // Add tables
  tables.forEach((table) => {
    content += `<h2>${table.title}</h2>`;
    if (table.data && table.data.length > 0) {
      content += "<table>";
      const headers = Object.keys(table.data[0]);
      content += "<thead><tr>";
      headers.forEach((header) => {
        content += `<th>${header}</th>`;
      });
      content += "</tr></thead><tbody>";

      table.data.forEach((row) => {
        content += "<tr>";
        headers.forEach((header) => {
          const value = row[header];
          content += `<td>${value !== null && value !== undefined ? value : ""}</td>`;
        });
        content += "</tr>";
      });

      content += "</tbody></table>";
    } else {
      content += "<p>No data available</p>";
    }
  });

  return content;
}

/**
 * Export dashboard data to multiple formats
 */
export function exportDashboardData(
  format: "csv" | "pdf",
  title: string,
  dateRange: { from: Date; to: Date },
  data: {
    kpis?: Record<string, string | number>;
    tables?: Array<{ title: string; data: Record<string, any>[] }>;
  }
): void {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${title.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;

  if (format === "csv") {
    // For CSV, we export the first table or all data combined
    if (data.tables && data.tables.length > 0) {
      const combinedData = data.tables[0].data;
      downloadCSV(combinedData, filename);
    }
  } else if (format === "pdf") {
    const pdfContent = generateDashboardPDF(title, dateRange, data.kpis || {}, data.tables || []);
    generatePDFFromHTML(pdfContent, filename);
  }
}

/**
 * Format number for display in exports
 */
export function formatNumberForExport(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format currency for display in exports
 */
export function formatCurrencyForExport(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage for display in exports
 */
export function formatPercentageForExport(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for display in exports
 */
export function formatDateForExport(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
