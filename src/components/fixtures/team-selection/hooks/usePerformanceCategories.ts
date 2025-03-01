
import { useState } from "react";
import { PerformanceCategories } from "../types";

export const usePerformanceCategories = () => {
  const [performanceCategories, setPerformanceCategories] = useState<PerformanceCategories>({});

  // Initialize performance category for a new period
  const initializePerformanceCategory = (
    periodId: string, 
    teamId: string, 
    lastPeriodId: string | null,
    existingCategories: PerformanceCategories
  ) => {
    let newCategory = 'MESSI';
    
    // Copy performance category from the last period if available
    if (lastPeriodId) {
      const lastCategory = existingCategories[`${lastPeriodId}-${teamId}`] || 'MESSI';
      newCategory = lastCategory;
    }
    
    setPerformanceCategories(prev => ({
      ...prev,
      [`${periodId}-${teamId}`]: newCategory
    }));
    
    return newCategory;
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
    cleanupPerformanceCategory
  };
};
