
import { useState, useEffect } from "react";
import { PerformanceCategories } from "../types";

// Define fallback performance categories since the table doesn't exist
const DEFAULT_PERFORMANCE_CATEGORIES = ["MESSI", "RONALDO", "JAGS"];

export const usePerformanceCategories = () => {
  const [performanceCategories, setPerformanceCategories] = useState<PerformanceCategories>({});
  const [availableCategories, setAvailableCategories] = useState(DEFAULT_PERFORMANCE_CATEGORIES);

  // Initialize performance categories for a new period
  const initializePerformanceCategory = (
    newPeriodId: string,
    teamId: string,
    lastPeriodId: string | null,
    existingCategories: PerformanceCategories
  ) => {
    // Get the performance category from the last period if available
    let performanceCategory = "MESSI"; // Default to MESSI
    
    if (lastPeriodId && existingCategories[`${lastPeriodId}-${teamId}`]) {
      performanceCategory = existingCategories[`${lastPeriodId}-${teamId}`];
    }
    
    // Update state
    setPerformanceCategories(prev => ({
      ...prev,
      [`${newPeriodId}-${teamId}`]: performanceCategory
    }));
    
    return performanceCategory;
  };

  // Clean up performance category for deleted period
  const cleanupPerformanceCategory = (teamId: string, periodId: string) => {
    setPerformanceCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[`${periodId}-${teamId}`];
      return newCategories;
    });
  };

  return {
    performanceCategories,
    setPerformanceCategories,
    initializePerformanceCategory,
    cleanupPerformanceCategory,
    availableCategories
  };
};
