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
  const pageHeight = doc.internal.pageSize.getHeight();
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

  // Table
  const tableData = exportData.data.map((row) =>
    exportData.columns.map((col) => String(row[col] || ""))
  );

  doc.autoTable({
    head: [exportData.columns],
    body: tableData,
    startY: yPosition,
    margin: 10,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
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
  titleCell.alignment = { horizontal: "center", vertical: "center" };

  // Subtitle
  if (exportData.subtitle) {
    worksheet.mergeCells("A2:E2");
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = exportData.subtitle;
    subtitleCell.font = { size: 12 };
    subtitleCell.alignment = { horizontal: "center" };
  }

  // Date range
  let dataStartRow = 4;
  if (exportData.dateRange) {
    worksheet.mergeCells("A3:E3");
    const dateCell = worksheet.getCell("A3");
    dateCell.value = `${exportData.dateRange.start.toLocaleDateString()} - ${exportData.dateRange.end.toLocaleDateString()}`;
    dateCell.font = { size: 10, italic: true };
    dateCell.alignment = { horizontal: "center" };
    dataStartRow = 5;
  }

  // Headers
  const headerRow = worksheet.addRow(exportData.columns);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2980B9" } };
  headerRow.alignment = { horizontal: "center", vertical: "center" };

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
