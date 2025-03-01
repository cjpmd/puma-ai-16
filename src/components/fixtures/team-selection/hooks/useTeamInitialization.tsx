
import { useEffect } from "react";
import { Fixture } from "@/types/fixture";
import { useTeamSelection } from "../context/TeamSelectionContext";

export const useTeamInitialization = () => {
  const { fixture, setTeams } = useTeamSelection();

  // Initialize the teams when the fixture changes
  useEffect(() => {
    if (fixture) {
      const numTeams = fixture.number_of_teams || 1;
      const newTeams: Record<string, { name: string; squadPlayers: string[] }> = {};
      
      for (let i = 0; i < numTeams; i++) {
        const teamId = String(i);
        newTeams[teamId] = {
          name: `Team ${i + 1}`,
          squadPlayers: []
        };
      }
      
      setTeams(newTeams);
    }
  }, [fixture, setTeams]);

  return null;
};
