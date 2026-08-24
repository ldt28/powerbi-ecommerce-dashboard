import { jsPDF } from "jspdf";
import { Workbook } from "exceljs";
import { Buffer } from "buffer";

export interface ExportData {
  title: string;
  subtitle?: string;
  data: Array<Record<string, any>>;
  columns: string[];
  dateRange?: { start: Date; end: Date };
}

export async function exportToPDF(exportData: ExportData): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(16);
  doc.text(exportData.title, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Subtitle
  if (exportData.subtitle) {
    doc.setFontSize(12);
    doc.text(exportData.subtitle, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
  }

  // Date range
  if (exportData.dateRange) {
    doc.setFontSize(10);
    const dateStr = `${exportData.dateRange.start.toLocaleDateString()} - ${exportData.dateRange.end.toLocaleDateString()}`;
    doc.text(dateStr, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
  }

  yPosition += 5;

  // Render Table Headers
  const colWidth = (pageWidth - 20) / Math.max(exportData.columns.length, 1);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  exportData.columns.forEach((col, i) => {
    doc.text(String(col), 10 + i * colWidth, yPosition);
  });
  yPosition += 6;
  doc.line(10, yPosition - 2, pageWidth - 10, yPosition - 2);

  // Render Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  exportData.data.slice(0, 35).forEach((row) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    exportData.columns.forEach((col, i) => {
      const val = String(row[col] ?? "");
      const truncated = val.length > 20 ? val.substring(0, 18) + "..." : val;
      doc.text(truncated, 10 + i * colWidth, yPosition);
    });
    yPosition += 6;
  });

  return Buffer.from(doc.output("arraybuffer"));
}

export async function exportToExcel(exportData: ExportData): Promise<Buffer> {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Export");

  // Title
  worksheet.mergeCells("A1:E1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = exportData.title;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: "center" as any, vertical: "middle" as any };

  // Subtitle
  if (exportData.subtitle) {
    worksheet.mergeCells("A2:E2");
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = exportData.subtitle;
    subtitleCell.font = { size: 12 };
    subtitleCell.alignment = { horizontal: "center" as any };
  }

  // Date range
  let dataStartRow = 4;
  if (exportData.dateRange) {
    worksheet.mergeCells("A3:E3");
    const dateCell = worksheet.getCell("A3");
    dateCell.value = `${exportData.dateRange.start.toLocaleDateString()} - ${exportData.dateRange.end.toLocaleDateString()}`;
    dateCell.font = { size: 10, italic: true };
    dateCell.alignment = { horizontal: "center" as any };
    dataStartRow = 5;
  }

  // Headers
  const headerRow = worksheet.addRow(exportData.columns);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2980B9" } };
  headerRow.alignment = { horizontal: "center" as any, vertical: "middle" as any };

  // Data
  exportData.data.forEach((row) => {
    const values = exportData.columns.map((col) => row[col] || "");
    worksheet.addRow(values);
  });

  // Auto-fit columns
  exportData.columns.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportToCSV(exportData: ExportData): Promise<Buffer> {
  const rows: string[] = [];

  // Title
  rows.push(exportData.title);

  // Subtitle
  if (exportData.subtitle) {
    rows.push(exportData.subtitle);
  }

  // Date range
  if (exportData.dateRange) {
    rows.push(
      `${exportData.dateRange.start.toLocaleDateString()} - ${exportData.dateRange.end.toLocaleDateString()}`
    );
  }

  // Empty line
  rows.push("");

  // Headers
  rows.push(exportData.columns.map((col) => `"${col}"`).join(","));

  // Data
  exportData.data.forEach((row) => {
    const values = exportData.columns.map((col) => {
      const value = row[col];
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value || "";
    });
    rows.push(values.join(","));
  });

  return Buffer.from(rows.join("\n"), "utf-8");
}
