
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeamSelectionCard } from "./TeamSelectionCard";
import { usePlayersWithAttendance } from "./hooks/usePlayersWithAttendance";
import { useTeamSelections } from "./hooks/useTeamSelections";
import { Fixture } from "@/types/fixture";
import { FormationFormat } from "@/components/formation/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceCategory } from "@/types/player";

interface TeamSelectionManagerProps {
  teams?: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format?: FormationFormat;
  fixture?: Fixture | null;
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>) => void;
  onSuccess?: () => void;
}

export const TeamSelectionManager = ({
  teams: providedTeams,
  format: providedFormat,
  fixture,
  onTeamSelectionsChange,
  onSuccess
}: TeamSelectionManagerProps) => {
  // Use teams from fixture if available, otherwise use provided teams
  const teams = fixture ? [
    {
      id: fixture.id,
      name: fixture.category || "Team",
      category: fixture.category || ""
    }
  ] : providedTeams || [];
  
  // Use format from fixture if available, otherwise use provided format
  const format = fixture?.format as FormationFormat || providedFormat || "7-a-side";
  
  const { 
    teamSelections, 
    selectedPlayers, 
    performanceCategories, 
    teamFormationTemplates,
    handleTeamSelectionChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    saveSelections
  } = useTeamSelections(onTeamSelectionsChange);
  
  const { playersWithStatus, isLoading, error } = usePlayersWithAttendance();
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState("formation"); // "formation" or "periods"

  // Ensure format is one of the allowed values
  const validFormat = (format === "5-a-side" || format === "7-a-side" || format === "9-a-side" || format === "11-a-side") 
    ? format 
    : "7-a-side";

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await saveSelections();
      
      if (success && onSuccess) {
        onSuccess();
      }
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
      <Tabs defaultValue="formation" className="w-full" onValueChange={setActiveView}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="formation">Formation</TabsTrigger>
            <TabsTrigger value="periods">Time Periods</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="formation" className="mt-0">
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
              viewMode="formation"
            />
          ))}
        </TabsContent>

        <TabsContent value="periods" className="mt-0">
          {teams.map(team => (
            <div key={team.id} className="mb-6">
              <h3 className="text-lg font-medium mb-4">{team.name} - Time Periods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">First Half</h4>
                  <TeamSelectionCard
                    team={team}
                    format={validFormat}
                    players={playersWithStatus}
                    selectedPlayers={selectedPlayers}
                    performanceCategory={performanceCategories[team.id] || "MESSI"}
                    onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
                    onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
                    formationTemplate={teamFormationTemplates[team.id] || "All"}
                    onTemplateChange={(template) => handleTemplateChange(team.id, template)}
                    viewMode="team-sheet"
                    periodNumber={1}
                    duration={20}
                  />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Second Half</h4>
                  <TeamSelectionCard
                    team={team}
                    format={validFormat}
                    players={playersWithStatus}
                    selectedPlayers={selectedPlayers}
                    performanceCategory={performanceCategories[team.id] || "MESSI"}
                    onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
                    onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
                    formationTemplate={teamFormationTemplates[team.id] || "All"}
                    onTemplateChange={(template) => handleTemplateChange(team.id, template)}
                    viewMode="team-sheet"
                    periodNumber={2}
                    duration={20}
                  />
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

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
