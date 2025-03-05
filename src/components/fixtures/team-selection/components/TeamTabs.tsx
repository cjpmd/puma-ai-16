
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamSelection } from "../context/TeamSelectionContext";

export const TeamTabs = () => {
  const { teams, activeTeamId, setActiveTeamId } = useTeamSelection();
  
  return (
    <Tabs value={activeTeamId} onValueChange={setActiveTeamId} className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        {Object.entries(teams).map(([teamId, team]) => (
          <TabsTrigger key={teamId} value={teamId} className="text-center py-2">
            {team.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
