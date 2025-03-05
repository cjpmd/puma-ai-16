
import { useState, useCallback } from "react";
import { PeriodsPerTeam, AllSelections } from "../types";
import { Fixture } from "@/types/fixture";

export const usePeriods = () => {
  const [periodsPerTeam, setPeriodsPerTeam] = useState<PeriodsPerTeam>({});
  
  // Handler for deleting periods
  const handleDeletePeriod = useCallback((teamId: string, periodId: string) => {
    setPeriodsPerTeam(prev => {
      // Don't delete if it's the only period
      if (prev[teamId]?.length <= 1) {
        return prev;
      }
      
      const newPeriodsPerTeam = { ...prev };
      newPeriodsPerTeam[teamId] = prev[teamId].filter(p => p.id !== periodId);
      return newPeriodsPerTeam;
    });
    
    return { teamId, periodId };
  }, []);

  // Handler for adding periods
  const handleAddPeriod = useCallback((teamId: string) => {
    const currentPeriods = periodsPerTeam[teamId] || [];
    const newPeriodNumber = currentPeriods.length + 1;
    const newPeriodId = `period-${newPeriodNumber}`;
    
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: [...(prev[teamId] || []), { id: newPeriodId, duration: 20 }]
    }));
    
    console.log(`Added period ${newPeriodId} to team ${teamId}`);
    return { teamId, newPeriodId, lastPeriodId: currentPeriods.length > 0 ? currentPeriods[currentPeriods.length - 1].id : null };
  }, [periodsPerTeam]);

  // Handler for duration changes
  const handleDurationChange = useCallback((teamId: string, periodId: string, duration: number) => {
    setPeriodsPerTeam(prev => ({
      ...prev,
      [teamId]: prev[teamId].map(period => 
        period.id === periodId ? { ...period, duration } : period
      )
    }));
    
    console.log(`Changed duration of period ${periodId} for team ${teamId} to ${duration} minutes`);
  }, []);
  
  // Initialize periods for each team when fixture changes
  const initializeTeamPeriods = useCallback((fixture: Fixture | null) => {
    if (!fixture) return null;

    const newPeriodsPerTeam: PeriodsPerTeam = {};

    // Get the number of teams
    const teamCount = fixture.number_of_teams || 1;
    
    // Initialize one period for each team
    for (let i = 0; i < teamCount; i++) {
      const teamId = i.toString();
      const periodId = `period-1`;
      
      newPeriodsPerTeam[teamId] = [{ id: periodId, duration: 20 }];
    }

    console.log("Initializing periods for teams:", newPeriodsPerTeam);
    
    setPeriodsPerTeam(newPeriodsPerTeam);
    return newPeriodsPerTeam;
  }, []);

  return {
    periodsPerTeam,
    setPeriodsPerTeam,
    handleDeletePeriod,
    handleAddPeriod,
    handleDurationChange,
    initializeTeamPeriods
  };
};
