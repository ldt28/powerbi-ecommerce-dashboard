import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDrilldown, DrilldownLevel } from "@/contexts/DrilldownContext";

/**
 * Drill-Down Detail View Component
 * Displays detailed information for drill-down levels
 */

interface DetailField {
  label: string;
  value: string | number | React.ReactNode;
  type?: "text" | "number" | "percentage" | "currency" | "badge";
}

interface DrilldownDetailViewProps {
  title: string;
  fields: DetailField[];
  relatedItems?: Array<{
    id: string;
    label: string;
    value: string | number;
    onClick?: () => void;
  }>;
  actions?: React.ReactNode;
}

export const DrilldownDetailView: React.FC<DrilldownDetailViewProps> = ({
  title,
  fields,
  relatedItems,
  actions,
}) => {
  const formatValue = (value: string | number | React.ReactNode, type?: string) => {
    if (typeof value === "object") return value;
    if (type === "currency") return `$${Number(value).toLocaleString()}`;
    if (type === "percentage") return `${Number(value).toFixed(2)}%`;
    if (type === "number") return Number(value).toLocaleString();
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{field.label}</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatValue(field.value, field.type)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Items */}
      {relatedItems && relatedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex items-center justify-between p-3 rounded-lg border border-border ${
                    item.onClick
                      ? "cursor-pointer hover:bg-accent hover:border-accent transition-colors"
                      : ""
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * Drill-Down Summary View Component
 * Displays summary cards that can be clicked to drill down
 */

interface SummaryCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface DrilldownSummaryViewProps {
  title: string;
  cards: SummaryCard[];
  columns?: number;
}

export const DrilldownSummaryView: React.FC<DrilldownSummaryViewProps> = ({
  title,
  cards,
  columns = 3,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div
        className={`grid gap-4 grid-cols-1 ${
          columns === 2
            ? "md:grid-cols-2"
            : columns === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-4"
        }`}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            onClick={card.onClick}
            className="cursor-pointer hover:shadow-lg hover:border-primary transition-all"
          >
            <CardContent className="pt-6">
              <div className="space-y-3">
                {card.icon && <div className="text-2xl">{card.icon}</div>}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Drill-Down Table View Component
 * Displays drill-down data in table format with click-to-drill
 */

interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "percentage" | "currency";
  sortable?: boolean;
}

interface TableRow {
  id: string;
  [key: string]: any;
  onClick?: () => void;
}

interface DrilldownTableViewProps {
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
  onRowClick?: (row: TableRow) => void;
}

export const DrilldownTableView: React.FC<DrilldownTableViewProps> = ({
  title,
  columns,
  rows,
  onRowClick,
}) => {
  const formatValue = (value: any, type?: string) => {
    if (type === "currency") return `$${Number(value).toLocaleString()}`;
    if (type === "percentage") return `${Number(value).toFixed(2)}%`;
    if (type === "number") return Number(value).toLocaleString();
    return value;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => {
                      row.onClick?.();
                      onRowClick?.(row);
                    }}
                    className={`border-b border-border ${
                      row.onClick || onRowClick
                        ? "cursor-pointer hover:bg-accent transition-colors"
                        : ""
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-4 text-sm">
                        {formatValue(row[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
