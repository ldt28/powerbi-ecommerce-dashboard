// Alerts service - no DB imports needed for logic
// Import db and schema only when needed in routers

export interface AlertThreshold {
  metricName: string;
  operator: "greater_than" | "less_than" | "equals" | "between";
  value: number;
  value2?: number; // For "between" operator
}

export interface Alert {
  id: string;
  userId: string;
  title: string;
  description: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  isResolved: boolean;
  createdAt: Date;
}

// Database operations moved to routers for proper dependency injection

export async function checkThreshold(
  currentValue: number,
  threshold: AlertThreshold
): Promise<boolean> {
  switch (threshold.operator) {
    case "greater_than":
      return currentValue > threshold.value;
    case "less_than":
      return currentValue < threshold.value;
    case "equals":
      return currentValue === threshold.value;
    case "between":
      return (
        currentValue >= threshold.value &&
        currentValue <= (threshold.value2 || threshold.value)
      );
    default:
      return false;
  }
}

export function determineSeverity(
  currentValue: number,
  threshold: number,
  normalValue: number
): "low" | "medium" | "high" | "critical" {
  const deviation = Math.abs(currentValue - normalValue);
  const deviationPercent = (deviation / normalValue) * 100;

  if (deviationPercent >= 50) return "critical";
  if (deviationPercent > 30) return "high";
  if (deviationPercent > 15) return "medium";
  return "low";
}
