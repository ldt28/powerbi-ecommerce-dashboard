import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Sheet } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ExportButtonProps {
  title: string;
  dateRange?: string;
  metrics: Record<string, string | number>;
  tables?: Array<{
    name: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
  disabled?: boolean;
}

/**
 * ExportButton Component
 * Provides CSV and Excel export functionality for dashboard data
 */
export function ExportButton({
  title,
  dateRange,
  metrics,
  tables,
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportCSV = trpc.export.exportDashboardToCSV.useMutation();
  const exportExcel = trpc.export.exportDashboardToExcel.useMutation();

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const result = await exportCSV.mutateAsync({
        title,
        dateRange,
        metrics,
        tables,
      });

      // Create blob and download
      const blob = new Blob([result.content], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const result = await exportExcel.mutateAsync({
        title,
        dateRange,
        metrics,
        tables,
      });

      // Use XLSX library to create Excel file
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet(result.data);
      XLSX.utils.book_append_sheet(workbook, sheet, "Dashboard");
      XLSX.writeFile(workbook, result.filename);

      toast.success("Excel exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <Sheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
