
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { SquadSelectionGrid } from "@/components/formation/SquadSelectionGrid";
import { HalfPeriodManager } from "./HalfPeriodManager";
import { TeamHeaderControls } from "../../TeamHeaderControls";
import { useTeamSelection } from "../context/TeamSelectionContext";

interface NewTeamTabContentProps {
  teamId: string;
  team: { name: string; squadPlayers: string[] };
  fixture: any;
  teamCaptains: Record<string, string>;
  availablePlayers: any[];
  onCaptainChange: (teamId: string, playerId: string) => void;
  onSquadSelection: (teamId: string, playerIds: string[]) => void;
  onFormationChange: (teamId: string, halfId: string, periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  getPlayerTeams: (playerId: string) => string[];
}

export const NewTeamTabContent = ({
  teamId,
  team,
  fixture,
  teamCaptains,
  availablePlayers,
  onCaptainChange,
  onSquadSelection,
  onFormationChange,
  getPlayerTeams
}: NewTeamTabContentProps) => {
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [performanceCategories, setPerformanceCategories] = useState({
    'first-half': 'MESSI',
    'second-half': 'MESSI'
  });
  
  const { selections } = useTeamSelection();
  
  // Sync initial performance categories with existing selections
  useEffect(() => {
    if (selections[teamId]) {
      const firstHalfCategories = Object.keys(selections[teamId])
        .filter(halfId => halfId === 'first-half')
        .flatMap(halfId => 
          Object.entries(selections[teamId][halfId]).map(([periodId, periodSelections]) => {
            const firstSelection = Object.values(periodSelections)[0];
            return firstSelection?.performanceCategory || 'MESSI';
          })
        );
      
      const secondHalfCategories = Object.keys(selections[teamId])
        .filter(halfId => halfId === 'second-half')
        .flatMap(halfId => 
          Object.entries(selections[teamId][halfId]).map(([periodId, periodSelections]) => {
            const firstSelection = Object.values(periodSelections)[0];
            return firstSelection?.performanceCategory || 'MESSI';
          })
        );
      
      if (firstHalfCategories.length > 0) {
        setPerformanceCategories(prev => ({
          ...prev,
          'first-half': firstHalfCategories[0]
        }));
      }
      
      if (secondHalfCategories.length > 0) {
        setPerformanceCategories(prev => ({
          ...prev,
          'second-half': secondHalfCategories[0]
        }));
      }
    }
  }, [selections, teamId]);

  // Handle performance category changes
  const handlePerformanceCategoryChange = (halfId: string, value: string) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [halfId]: value
    }));
  };

  // Handle formation changes
  const handleFormationChange = (halfId: string, periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    onFormationChange(teamId, halfId, periodId, selections);
  };

  // Save squad selection
  const handleSaveSelection = () => {
    setShowOnlySelected(true);
  };

  return (
    <div className="space-y-4">
      <TeamHeaderControls
        teamId={teamId}
        teamCaptains={teamCaptains}
        availablePlayers={availablePlayers}
        onCaptainChange={onCaptainChange}
        performanceCategory={performanceCategories['first-half']}
        onPerformanceCategoryChange={(value) => {
          handlePerformanceCategoryChange('first-half', value);
          handlePerformanceCategoryChange('second-half', value);
        }}
        onAddPeriod={() => {}} // Not used in new design
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Squad Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <SquadSelectionGrid 
            availablePlayers={availablePlayers}
            selectedPlayers={team.squadPlayers}
            onSelectionChange={(playerIds) => onSquadSelection(teamId, playerIds)}
            getPlayerTeams={getPlayerTeams}
            onSaveSelection={handleSaveSelection}
          />
        </CardContent>
      </Card>
      
      <HalfPeriodManager
        title="First Half"
        teamId={teamId}
        fixture={fixture}
        availablePlayers={availablePlayers}
        squadPlayers={team.squadPlayers}
        onFormationChange={handleFormationChange}
        performanceCategory={performanceCategories['first-half']}
        onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange('first-half', value)}
        selections={selections[teamId]?.['first-half'] || {}}
      />
      
      <HalfPeriodManager
        title="Second Half"
        teamId={teamId}
        fixture={fixture}
        availablePlayers={availablePlayers}
        squadPlayers={team.squadPlayers}
        onFormationChange={handleFormationChange}
        performanceCategory={performanceCategories['second-half']}
        onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange('second-half', value)}
        selections={selections[teamId]?.['second-half'] || {}}
      />
    </div>
  );
};
