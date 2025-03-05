
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewTeamTabContent } from "./NewTeamTabContent";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamSelectionData } from "../hooks/useTeamSelectionData";
import { FormationFormat } from "@/components/formation/types";
import { PerformanceCategory } from "@/types/player";

export const TeamSelectionTabs = () => {
  const { 
    teams, 
    activeTab, 
    setActiveTab,
    teamCaptains,
    selections,
    handleCaptainChange,
    handleSquadSelection,
    handleFormationChange,
    getPlayerTeams,
    fixture,
    convertToSaveFormat
  } = useTeamSelection();

  // Create placeholders for the properties that don't exist in TeamSelectionContextType
  // These will be populated from the converted data from convertToSaveFormat
  const { allSelections, periodsPerTeam } = convertToSaveFormat ? convertToSaveFormat() : { allSelections: {}, periodsPerTeam: {} };
  const periodSelections = allSelections || {};
  const performanceCategories: Record<string, PerformanceCategory> = {};
  const selectedPlayers = new Set<string>();
  
  // Extract selected players from the selections
  Object.values(selections || {}).forEach(teamSelections => {
    Object.values(teamSelections || {}).forEach(halfSelections => {
      Object.values(halfSelections || {}).forEach(periodSelections => {
        Object.values(periodSelections || {}).forEach(selection => {
          if (selection.playerId && selection.playerId !== "unassigned") {
            selectedPlayers.add(selection.playerId);
          }
          
          // Extract performance categories if available
          if (selection.performanceCategory) {
            const teamId = Object.keys(selections).find(key => selections[key] === teamSelections);
            if (teamId) {
              performanceCategories[teamId] = selection.performanceCategory as PerformanceCategory;
            }
          }
        });
      });
    });
  });

  const { availablePlayers } = useTeamSelectionData(fixture?.id);
  
  // Function to handle period selections changes (placeholder that converts format)
  const setPeriodSelections = (teamId: string, periodNumber: string, selections: Record<string, { playerId: string; position: string }>) => {
    // This needs to be implemented to convert to the structure expected by handleFormationChange
    const halfId = "first-half"; // Default to first half
    handleFormationChange(teamId, halfId, periodNumber, selections);
  };

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full mb-4">
        {Object.keys(teams).map((teamId) => (
          <TabsTrigger key={teamId} value={teamId}>
            Team {parseInt(teamId) + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {Object.entries(teams).map(([teamId, teamData]) => (
        <TabsContent key={teamId} value={teamId}>
          <NewTeamTabContent
            teamId={teamId}
            teamName={teamData.name}
            fixture={fixture}
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayers}
            periodSelections={periodSelections[teamId] || {}}
            performanceCategories={performanceCategories}
            setPeriodSelections={setPeriodSelections}
            onPerformanceCategoryChange={(teamId, category) => {
              // This is a placeholder - implement as needed
              console.log("Change performance category", teamId, category);
            }}
            format={(fixture?.format || "7-a-side") as FormationFormat}
            captainId={teamCaptains[teamId]}
            setCaptainId={handleCaptainChange}
            getPlayerTeams={getPlayerTeams}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};
