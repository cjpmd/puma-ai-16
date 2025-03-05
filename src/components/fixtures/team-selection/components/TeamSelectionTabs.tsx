
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewTeamTabContent } from "./NewTeamTabContent";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamSelectionData } from "../hooks/useTeamSelectionData";
import { FormationFormat } from "@/components/formation/types";

export const TeamSelectionTabs = () => {
  const { 
    teams, 
    activeTab, 
    setActiveTab,
    teamCaptains,
    periodSelections,
    performanceCategories,
    handleCaptainChange,
    handleSquadSelection,
    handleFormationChange,
    getPlayerTeams,
    fixture,
    selectedPlayers = new Set<string>(),
    setPeriodSelections
  } = useTeamSelection();

  const { availablePlayers } = useTeamSelectionData(fixture?.id);

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full mb-4">
        {Object.keys(teams).map((teamId) => (
          <TabsTrigger key={teamId} value={teamId}>
            Team {parseInt(teamId) + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {Object.entries(teams).map(([teamId, team]) => (
        <TabsContent key={teamId} value={teamId}>
          <NewTeamTabContent
            teamId={teamId}
            teamName={team.name}
            fixture={fixture}
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayers}
            periodSelections={periodSelections?.[teamId] || {}}
            performanceCategories={performanceCategories}
            setPeriodSelections={setPeriodSelections}
            onPerformanceCategoryChange={(teamId, category) => {
              // This needs to be implemented in your context
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
