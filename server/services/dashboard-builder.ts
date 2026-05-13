export interface DashboardWidget {
  id: string;
  type: "chart" | "metric" | "table" | "text";
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CustomDashboard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createWidget(
  type: DashboardWidget["type"],
  title: string,
  config: Record<string, any>,
  position: DashboardWidget["position"]
): DashboardWidget {
  return {
    id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    config,
    position,
  };
}

export function validateDashboard(dashboard: CustomDashboard): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dashboard.name || dashboard.name.trim().length === 0) {
    errors.push("Dashboard name is required");
  }

  if (!dashboard.widgets || dashboard.widgets.length === 0) {
    errors.push("Dashboard must have at least one widget");
  }

  dashboard.widgets.forEach((widget, index) => {
    if (!widget.title || widget.title.trim().length === 0) {
      errors.push(`Widget ${index + 1}: Title is required`);
    }

    if (widget.position.width <= 0 || widget.position.height <= 0) {
      errors.push(`Widget ${index + 1}: Invalid dimensions`);
    }

    if (widget.position.x < 0 || widget.position.y < 0) {
      errors.push(`Widget ${index + 1}: Invalid position`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateGridLayout(
  widgetCount: number,
  maxColumns = 3
): Array<{ x: number; y: number; width: number; height: number }> {
  const positions: Array<{ x: number; y: number; width: number; height: number }> = [];
  let currentRow = 0;
  let currentCol = 0;

  for (let i = 0; i < widgetCount; i++) {
    positions.push({
      x: currentCol * 4,
      y: currentRow * 4,
      width: 4,
      height: 4,
    });

    currentCol++;
    if (currentCol >= maxColumns) {
      currentCol = 0;
      currentRow++;
    }
  }

  return positions;
}

export function mergeWidgets(
  existing: DashboardWidget[],
  updated: DashboardWidget[]
): DashboardWidget[] {
  const existingMap = new Map(existing.map((w) => [w.id, w]));

  updated.forEach((widget) => {
    existingMap.set(widget.id, widget);
  });

  return Array.from(existingMap.values());
}
