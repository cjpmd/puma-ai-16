
import { useState, useEffect } from "react";
import { PerformanceCategories } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define fallback performance categories since the table doesn't exist
const DEFAULT_PERFORMANCE_CATEGORIES = ["MESSI", "RONALDO", "JAGS"];

export const usePerformanceCategories = () => {
  const [performanceCategories, setPerformanceCategories] = useState<PerformanceCategories>({});
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_PERFORMANCE_CATEGORIES);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const { toast } = useToast();

  // Fetch categories from database, fallback to defaults if table doesn't exist
  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const { data, error } = await supabase
          .from("performance_categories")
          .select("*")
          .order("name", { ascending: true });
          
        if (error) {
          // Check if this is the "table doesn't exist" error
          if (error.code === '42P01') {
            console.error("Error fetching performance categories:", error);
            // Use default categories
            setAvailableCategories(DEFAULT_PERFORMANCE_CATEGORIES);
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          // If we have categories from the database, use those
          setAvailableCategories(data.map(cat => cat.name));
        } else {
          // Fallback to defaults
          setAvailableCategories(DEFAULT_PERFORMANCE_CATEGORIES);
        }
      } catch (err) {
        console.error("Exception fetching performance categories:", err);
        // Fallback to defaults
        setAvailableCategories(DEFAULT_PERFORMANCE_CATEGORIES);
      } finally {
        setIsFetchingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Initialize performance categories for a new period
  const initializePerformanceCategory = (
    newPeriodId: string,
    teamId: string,
    lastPeriodId: string | null,
    existingCategories: PerformanceCategories
  ) => {
    // Get the performance category from the last period if available
    let performanceCategory = availableCategories[0] || "MESSI"; // Default to first category or MESSI
    
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

  // Set explicit category for a period-team combination
  const setPerformanceCategory = (periodId: string, teamId: string, category: string) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [`${periodId}-${teamId}`]: category
    }));
  };

  return {
    performanceCategories,
    setPerformanceCategories,
    initializePerformanceCategory,
    cleanupPerformanceCategory,
    availableCategories,
    setPerformanceCategory,
    isFetchingCategories
  };
};
