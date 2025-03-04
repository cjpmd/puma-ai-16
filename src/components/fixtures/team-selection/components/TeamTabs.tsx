
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTeamSelection } from "../context/TeamSelectionContext";

export const TeamTabs = () => {
  const { teams, activeTeamId, setActiveTeamId } = useTeamSelection();
  
  // Handle team tab change
  const handleTeamChange = (value: string) => {
    setActiveTeamId(value);
  };

  return (
    <Tabs
      value={activeTeamId}
      onValueChange={handleTeamChange}
      className="w-full"
    >
      <TabsList className="mb-4 w-full justify-start overflow-auto">
        {Object.entries(teams).map(([teamId, team]) => (
          <TabsTrigger key={teamId} value={teamId}>
            {team.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
