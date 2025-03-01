
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewTeamTabContent } from "./NewTeamTabContent";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamSelectionData } from "../hooks/useTeamSelectionData";

export const TeamSelectionTabs = () => {
  const { 
    teams, 
    activeTab, 
    setActiveTab,
    teamCaptains,
    handleCaptainChange,
    handleSquadSelection,
    handleFormationChange,
    getPlayerTeams,
    fixture
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
            team={team}
            fixture={fixture}
            teamCaptains={teamCaptains}
            availablePlayers={availablePlayers}
            onCaptainChange={handleCaptainChange}
            onSquadSelection={handleSquadSelection}
            onFormationChange={handleFormationChange}
            getPlayerTeams={getPlayerTeams}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};
