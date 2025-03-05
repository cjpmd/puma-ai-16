
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamSelectionCard } from "./TeamSelectionCard";
import { usePlayersWithAttendance } from "./hooks/usePlayersWithAttendance";
import { useTeamSelections } from "./hooks/useTeamSelections";

interface TeamSelectionManagerProps {
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format: string;
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>) => void;
}

export const TeamSelectionManager = ({
  teams,
  format,
  onTeamSelectionsChange 
}: TeamSelectionManagerProps) => {
  const { 
    teamSelections, 
    selectedPlayers, 
    performanceCategories, 
    teamFormationTemplates,
    handleTeamSelectionChange,
    handlePerformanceCategoryChange,
    handleTemplateChange
  } = useTeamSelections(onTeamSelectionsChange);
  
  const { playersWithStatus, isLoading, error } = usePlayersWithAttendance();
  const [isSaving, setIsSaving] = useState(false);

  // Ensure format is one of the allowed values
  const validFormat = (format === "5-a-side" || format === "7-a-side" || format === "9-a-side" || format === "11-a-side") 
    ? format 
    : "7-a-side";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Save team selections logic here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      // Success toast is now handled in the hook
    } catch (error) {
      console.error("Error saving team selections:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error loading players: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {teams.map(team => (
        <TeamSelectionCard
          key={team.id}
          team={team}
          format={validFormat}
          players={playersWithStatus}
          selectedPlayers={selectedPlayers}
          performanceCategory={performanceCategories[team.id] || "MESSI"}
          onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
          onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
          formationTemplate={teamFormationTemplates[team.id] || "All"}
          onTemplateChange={(template) => handleTemplateChange(team.id, template)}
        />
      ))}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Team Selections'}
        </Button>
      </div>
    </div>
  );
};
