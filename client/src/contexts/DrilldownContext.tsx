import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Drill-Down Navigation Context
 * Manages drill-down state, history, and navigation
 */

export interface DrilldownLevel {
  id: string;
  title: string;
  type: "summary" | "category" | "detail";
  data?: Record<string, any>;
  breadcrumbLabel: string;
}

interface DrilldownContextType {
  levels: DrilldownLevel[];
  currentLevel: DrilldownLevel | null;
  canGoBack: boolean;
  canGoForward: boolean;
  drillDown: (level: DrilldownLevel) => void;
  goBack: () => void;
  goForward: () => void;
  reset: () => void;
  getBreadcrumbs: () => DrilldownLevel[];
}

const DrilldownContext = createContext<DrilldownContextType | undefined>(undefined);

export const DrilldownProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [levels, setLevels] = useState<DrilldownLevel[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const currentLevel = currentIndex >= 0 ? levels[currentIndex] : null;
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < levels.length - 1;

  const drillDown = useCallback((level: DrilldownLevel) => {
    setLevels((prev) => {
      // Remove any forward history when drilling down
      const newLevels = prev.slice(0, currentIndex + 1);
      newLevels.push(level);
      return newLevels;
    });
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canGoBack]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [canGoForward]);

  const reset = useCallback(() => {
    setLevels([]);
    setCurrentIndex(-1);
  }, []);

  const getBreadcrumbs = useCallback(() => {
    return levels.slice(0, currentIndex + 1);
  }, [levels, currentIndex]);

  return (
    <DrilldownContext.Provider
      value={{
        levels,
        currentLevel,
        canGoBack,
        canGoForward,
        drillDown,
        goBack,
        goForward,
        reset,
        getBreadcrumbs,
      }}
    >
      {children}
    </DrilldownContext.Provider>
  );
};

export const useDrilldown = () => {
  const context = useContext(DrilldownContext);
  if (!context) {
    throw new Error("useDrilldown must be used within DrilldownProvider");
  }
  return context;
};
