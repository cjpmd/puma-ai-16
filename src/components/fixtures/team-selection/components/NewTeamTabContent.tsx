
import { useState } from "react";
import { TeamHeaderControls } from "../../TeamHeaderControls";
import { SquadSelectionCard } from "./SquadSelectionCard";
import { PeriodCard } from "./PeriodCard";
import { PeriodSelector } from "./PeriodSelector";
import { ViewToggleButton } from "./ViewToggleButton";
import { Button } from "@/components/ui/button";
import { PerformanceCategory } from "@/types/player";

interface NewTeamTabContentProps {
  teamId: string;
  teamName: string;
  fixture: any;
  availablePlayers: any[];
  selectedPlayers: Set<string>;
  periodSelections: Record<number, Record<string, { playerId: string; position: string }>>;
  performanceCategories: Record<string, PerformanceCategory | string>;
  setPeriodSelections: (teamId: string, periodNumber: number, selections: Record<string, { playerId: string; position: string }>) => void;
  onPerformanceCategoryChange: (teamId: string, value: PerformanceCategory) => void;
  format: string;
  captainId?: string;
  setCaptainId: (teamId: string, playerId: string) => void;
}

export const NewTeamTabContent = ({
  teamId,
  teamName,
  fixture,
  availablePlayers,
  selectedPlayers,
  periodSelections,
  performanceCategories,
  setPeriodSelections,
  onPerformanceCategoryChange,
  format,
  captainId,
  setCaptainId
}: NewTeamTabContentProps) => {
  const [activePeriod, setActivePeriod] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [squadPlayers, setSquadPlayers] = useState<string[]>([]);
  const [showSquadSelector, setShowSquadSelector] = useState(false);
  
  // Map of period numbers to durations
  const [periodDurations, setPeriodDurations] = useState<Record<number, number>>({
    1: 45,
    2: 45
  });

  // Get current performance category
  const currentPerformanceCategory = (performanceCategories[teamId] || "MESSI") as PerformanceCategory;
  
  // Calculate total number of periods (minimum 2)
  const totalPeriods = Math.max(2, Object.keys(periodSelections).length);
  
  const handlePeriodSelectionChange = (periodNumber: number, selections: Record<string, { playerId: string; position: string }>) => {
    setPeriodSelections(teamId, periodNumber, selections);
  };
  
  const handleDurationChange = (periodNumber: number, duration: number) => {
    setPeriodDurations(prev => ({
      ...prev,
      [periodNumber]: duration
    }));
  };
  
  const handleSquadSelectionChange = (playerIds: string[]) => {
    setSquadPlayers(playerIds);
  };
  
  const handleAddPeriod = () => {
    const newPeriodNumber = totalPeriods + 1;
    // Set an initial duration for the new period
    setPeriodDurations(prev => ({
      ...prev,
      [newPeriodNumber]: 15 // Default to 15 minutes for additional periods
    }));
  };
  
  const handleCaptainChange = (playerId: string) => {
    setCaptainId(teamId, playerId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{teamName}</h2>
        <ViewToggleButton 
          viewMode={viewMode} 
          onChange={setViewMode} 
        />
      </div>
      
      <TeamHeaderControls
        teamId={teamId}
        teamCaptains={{ [teamId]: captainId || "" }}
        availablePlayers={availablePlayers}
        onCaptainChange={handleCaptainChange}
        performanceCategory={currentPerformanceCategory}
        onPerformanceCategoryChange={(teamId, periodId, category) => onPerformanceCategoryChange(teamId, category)}
        onAddPeriod={handleAddPeriod}
      />
      
      {showSquadSelector && (
        <SquadSelectionCard
          availablePlayers={availablePlayers}
          selectedPlayers={squadPlayers}
          onSelectionChange={handleSquadSelectionChange}
          getPlayerTeams={() => []}
        />
      )}
      
      <PeriodSelector 
        periodCount={totalPeriods}
        activePeriod={activePeriod}
        onPeriodChange={setActivePeriod}
      />
      
      <PeriodCard
        periodNumber={activePeriod}
        teamId={teamId}
        format={format}
        duration={periodDurations[activePeriod] || 45}
        onDurationChange={(duration) => handleDurationChange(activePeriod, duration)}
        availablePlayers={availablePlayers}
        selectedPlayers={selectedPlayers}
        selections={periodSelections[activePeriod] || {}}
        onSelectionChange={(selections) => handlePeriodSelectionChange(activePeriod, selections)}
        performanceCategory={currentPerformanceCategory}
      />
      
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={handleAddPeriod}
          variant="outline"
        >
          Add Period
        </Button>
        <Button 
          onClick={() => setShowSquadSelector(!showSquadSelector)}
          variant="outline"
        >
          {showSquadSelector ? "Hide Squad Selector" : "Show Squad Selector"}
        </Button>
      </div>
    </div>
  );
};
