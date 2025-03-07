
import { useState, useCallback } from "react";

export type PeriodData = {
  id: number;
  name: string;
  duration: number;
  selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>;
};

interface UsePeriodManagementProps {
  onPeriodsChange?: (periods: Record<string, PeriodData[]>) => void;
}

export const usePeriodManagement = ({ onPeriodsChange }: UsePeriodManagementProps = {}) => {
  const [periods, setPeriods] = useState<Record<string, PeriodData[]>>({});

  const addPeriod = useCallback((teamId: string, halfNumber: number, periodName: string, duration: number) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      
      const baseId = halfNumber * 100;
      const existingIds = teamPeriods.filter(p => Math.floor(p.id / 100) === halfNumber).map(p => p.id);
      const nextId = existingIds.length > 0 
        ? Math.max(...existingIds) + 1 
        : baseId;
      
      const newPeriod: PeriodData = {
        id: nextId,
        name: periodName,
        duration,
        selections: {}
      };
      
      const updatedPeriods = {
        ...prev,
        [teamId]: [...teamPeriods, newPeriod].sort((a, b) => a.id - b.id)
      };
      
      if (onPeriodsChange) {
        onPeriodsChange(updatedPeriods);
      }
      
      return updatedPeriods;
    });
  }, [onPeriodsChange]);

  const editPeriod = useCallback((teamId: string, periodId: number, updates: Partial<PeriodData>) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      const updatedPeriods = {
        ...prev,
        [teamId]: teamPeriods.map(period => 
          period.id === periodId 
            ? { ...period, ...updates } 
            : period
        )
      };
      
      if (onPeriodsChange) {
        onPeriodsChange(updatedPeriods);
      }
      
      return updatedPeriods;
    });
  }, [onPeriodsChange]);

  const deletePeriod = useCallback((teamId: string, periodId: number) => {
    setPeriods(prev => {
      const teamPeriods = prev[teamId] || [];
      const updatedPeriods = {
        ...prev,
        [teamId]: teamPeriods.filter(period => period.id !== periodId)
      };
      
      if (onPeriodsChange) {
        onPeriodsChange(updatedPeriods);
      }
      
      return updatedPeriods;
    });
  }, [onPeriodsChange]);

  const initializeDefaultPeriods = useCallback((teamId: string) => {
    setPeriods(prev => {
      if (prev[teamId] && prev[teamId].length > 0) {
        return prev;
      }
      
      const updatedPeriods = {
        ...prev,
        [teamId]: [
          { id: 100, name: "First Half", duration: 45, selections: {} },
          { id: 200, name: "Second Half", duration: 45, selections: {} }
        ]
      };
      
      if (onPeriodsChange) {
        onPeriodsChange(updatedPeriods);
      }
      
      return updatedPeriods;
    });
  }, [onPeriodsChange]);

  return {
    periods,
    setPeriods,
    addPeriod,
    editPeriod,
    deletePeriod,
    initializeDefaultPeriods
  };
};
