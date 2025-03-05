
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PerformanceCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

// Fallback default categories if table doesn't exist
const DEFAULT_CATEGORIES = [
  { id: "MESSI", name: "Messi", description: "High performance", color: "#4CAF50" },
  { id: "RONALDO", name: "Ronaldo", description: "Medium performance", color: "#2196F3" },
  { id: "JAGS", name: "Jags", description: "Development focus", color: "#FFC107" }
];

export const usePerformanceCategories = () => {
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});
  const [availableCategories, setAvailableCategories] = useState<PerformanceCategory[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    // Attempt to fetch categories from DB
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("performance_categories")
          .select("*")
          .order("name", { ascending: true });
        
        if (error) {
          console.error("Error fetching performance categories:", error);
          // If table doesn't exist, use defaults
          if (error.code === "42P01") {
            setAvailableCategories(DEFAULT_CATEGORIES);
          }
          return;
        }
        
        if (data && data.length > 0) {
          setAvailableCategories(data);
        } else {
          setAvailableCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error("Exception fetching performance categories:", error);
        setAvailableCategories(DEFAULT_CATEGORIES);
      }
    };
    
    fetchCategories();
  }, []);

  // Initialize performance category based on last period
  const initializePerformanceCategory = (
    newPeriodId: string,
    teamId: string,
    lastPeriodId: string | null,
    existingCategories: Record<string, string>
  ) => {
    const lastPeriodKey = lastPeriodId ? `${lastPeriodId}-${teamId}` : null;
    const lastCategory = lastPeriodKey && existingCategories[lastPeriodKey] 
      ? existingCategories[lastPeriodKey] 
      : "MESSI";
    
    setPerformanceCategories(prev => ({
      ...prev,
      [`${newPeriodId}-${teamId}`]: lastCategory
    }));
  };

  // Clean up category for deleted period
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
    availableCategories,
    initializePerformanceCategory,
    cleanupPerformanceCategory
  };
};
