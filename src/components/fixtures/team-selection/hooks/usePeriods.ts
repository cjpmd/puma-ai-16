
import { useState } from "react";
import { PeriodsPerTeam, AllSelections } from "../types";

export const usePeriods = () => {
  const [periodsPerTeam, setPeriodsPerTeam] = useState<PeriodsPerTeam>({});
  
  // Handler for deleting periods
  const handleDeletePeriod = (teamId: string, periodId: string) => {
    setPeriodsPerTeam(prev => {
      const newPeriodsPerTeam = { ...prev };
      newPeriodsPerTeam[teamId] = prev[teamId].filter(p => p.id !== periodId);
      return newPeriodsPerTeam;
    });
    
    return { teamId, periodId };
  };

  // Handler for adding periods
  const handleAddPeriod = (teamId: string) => {
    const currentPeriods = periodsPerTeam[teamId] || [];
    const newPeriodNumber = currentPeriods.length + 1;
    const newPeriodId = `period-${newPeriodNumber}`;
    
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
    }));
    
    return { teamId, newPeriodId, lastPeriodId: currentPeriods.length > 0 ? currentPeriods[currentPeriods.length - 1].id : null };
  };

  // Handler for duration changes
  const handleDurationChange = (teamId: string, periodId: string, duration: number) => {
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: prev[teamId].map(period => 
        period.id === periodId ? { ...period, duration } : period
      )
    }));
  };
  
  // Initialize periods for each team when fixture changes
  const initializeTeamPeriods = (fixture: any) => {
    if (!fixture) return null;

    const newPeriodsPerTeam: PeriodsPerTeam = {};

    // Initialize one period for each team
    for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
      const teamId = i.toString();
      const periodId = `period-1`;
      
      newPeriodsPerTeam[teamId] = [{ id: periodId, duration: 20 }];
    }

    setPeriodsPerTeam(newPeriodsPerTeam);
    return newPeriodsPerTeam;
  };

  return {
    periodsPerTeam,
    setPeriodsPerTeam,
    handleDeletePeriod,
    handleAddPeriod,
    handleDurationChange,
    initializeTeamPeriods
  };
};
