import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Sheet } from "lucide-react";
import { exportDashboardData } from "@/lib/exportUtils";

interface ExportButtonsProps {
  title: string;
  dateRange: { from: Date; to: Date };
  data: {
    kpis?: Record<string, string | number>;
    tables?: Array<{ title: string; data: Record<string, any>[] }>;
  };
}

export function ExportButtons({ title, dateRange, data }: ExportButtonsProps) {
  const handleExport = (format: "csv" | "pdf") => {
    exportDashboardData(format, title, dateRange, data);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2 cursor-pointer">
          <Sheet className="h-4 w-4" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
