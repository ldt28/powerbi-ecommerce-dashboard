import React from "react";
import { ChevronRight, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDrilldown } from "@/contexts/DrilldownContext";

/**
 * Drill-Down Breadcrumb Navigation Component
 * Displays current drill-down path and navigation controls
 */

export const DrilldownBreadcrumb: React.FC = () => {
  const { getBreadcrumbs, canGoBack, canGoForward, goBack, goForward, reset } = useDrilldown();

  const breadcrumbs = getBreadcrumbs();
  const isEmpty = breadcrumbs.length === 0;

  if (isEmpty) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-card border-b border-border rounded-lg mb-4">
      {/* Back/Forward Navigation */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={goBack}
          disabled={!canGoBack}
          title="Go back"
          className="p-2 h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goForward}
          disabled={!canGoForward}
          title="Go forward"
          className="p-2 h-8 w-8"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Breadcrumb Path */}
      <div className="flex items-center gap-2 overflow-x-auto flex-1">
        {/* Home Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          title="Go to summary"
          className="p-1 h-8 w-8 flex-shrink-0"
        >
          <Home className="h-4 w-4" />
        </Button>

        {/* Breadcrumb Items */}
        {breadcrumbs.map((level, index) => (
          <React.Fragment key={level.id}>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span
              className={`text-sm px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ${
                index === breadcrumbs.length - 1
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground cursor-pointer"
              }`}
              title={level.title}
            >
              {level.breadcrumbLabel}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Breadcrumb Info */}
      <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
        Level {breadcrumbs.length}
      </div>
    </div>
  );
};
