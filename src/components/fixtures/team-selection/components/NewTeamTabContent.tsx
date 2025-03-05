
import { useState } from "react";
import { TeamHeaderControls } from "../../TeamHeaderControls";
import { SquadSelectionCard } from "./SquadSelectionCard";
import { AlternatePeriodCard } from "./PeriodCard";
import { PeriodSelector } from "./PeriodSelector";
import { ViewToggleButton } from "./ViewToggleButton";
import { Button } from "@/components/ui/button";
import { PerformanceCategory } from "@/types/player";
import { FormationFormat } from "@/components/formation/types";

interface NewTeamTabContentProps {
  teamId: string;
  teamName?: string;
  fixture?: any;
  availablePlayers: any[];
  selectedPlayers: Set<string>;
  periodSelections: Record<string, Record<string, { playerId: string; position: string }>>;
  performanceCategories: Record<string, PerformanceCategory | string>;
  setPeriodSelections: (teamId: string, periodNumber: string, selections: Record<string, { playerId: string; position: string }>) => void;
  onPerformanceCategoryChange: (teamId: string, value: PerformanceCategory) => void;
  format: FormationFormat | string;
  captainId?: string;
  setCaptainId: (teamId: string, playerId: string) => void;
  getPlayerTeams?: (playerId: string) => string[];
}

export const NewTeamTabContent = ({
  teamId,
  teamName = "Team",
  fixture,
  availablePlayers,
  selectedPlayers,
  periodSelections,
  performanceCategories,
  setPeriodSelections,
  onPerformanceCategoryChange,
  format,
  captainId,
  setCaptainId,
  getPlayerTeams = () => []
}: NewTeamTabContentProps) => {
  const [activePeriod, setActivePeriod] = useState<string>("1");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [squadPlayers, setSquadPlayers] = useState<string[]>([]);
  const [showSquadSelector, setShowSquadSelector] = useState(false);
  
  // Map of period numbers to durations
  const [periodDurations, setPeriodDurations] = useState<Record<string, number>>({
    "1": 45,
    "2": 45
  });

  // Get current performance category
  const currentPerformanceCategory = (performanceCategories[teamId] || "MESSI") as PerformanceCategory;
  
  // Calculate total number of periods (minimum 2)
  const totalPeriods = Math.max(2, Object.keys(periodSelections).length);
  
  const handlePeriodSelectionChange = (periodNumber: string, selections: Record<string, { playerId: string; position: string }>) => {
    setPeriodSelections(teamId, periodNumber, selections);
  };
  
  const handleDurationChange = (periodNumber: string, duration: number) => {
    setPeriodDurations(prev => ({
      ...prev,
      [periodNumber]: duration
    }));
  };
  
  const handleSquadSelectionChange = (playerIds: string[]) => {
    setSquadPlayers(playerIds);
  };
  
  const handleAddPeriod = () => {
    const newPeriodNumber = (totalPeriods + 1).toString();
    // Set an initial duration for the new period
    setPeriodDurations(prev => ({
      ...prev,
      [newPeriodNumber]: 15 // Default to 15 minutes for additional periods
    }));
  };
  
  const handleCaptainChange = (playerId: string) => {
    setCaptainId(teamId, playerId);
  };

  const handlePeriodChange = (periodId: string) => {
    setActivePeriod(periodId);
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
          getPlayerTeams={getPlayerTeams}
        />
      )}
      
      <PeriodSelector 
        periodCount={totalPeriods}
        activePeriod={activePeriod}
        onPeriodChange={handlePeriodChange}
      />
      
      <AlternatePeriodCard
        periodNumber={activePeriod}
        teamId={teamId}
        format={format as FormationFormat}
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
