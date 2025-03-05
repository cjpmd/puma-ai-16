
import { useEffect } from "react";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { usePeriods } from "./usePeriods";

export const useTeamInitialization = () => {
  const { fixture, setTeams, setActiveTeamId } = useTeamSelection();
  const { periodsPerTeam, handleAddPeriod, initializeTeamPeriods } = usePeriods();
  
  useEffect(() => {
    if (!fixture) return;

    console.log("Initializing teams from fixture:", fixture);
    
    const teamCount = fixture.number_of_teams || 1;
    const newTeams = {};
    
    // Create team entries based on the number of teams in the fixture
    for (let i = 0; i < teamCount; i++) {
      const teamId = i.toString();
      newTeams[teamId] = {
        name: i === 0 ? fixture.team_name : `Team ${i + 1}`,
        squadPlayers: []
      };
    }
    
    // Initialize team state
    setTeams(newTeams);
    
    // Set active team to first team
    setActiveTeamId("0");
    
    // Initialize periods for each team
    initializeTeamPeriods(fixture);
    
    console.log("Teams initialized:", newTeams);
    
    // Add a default period to each team if none exist
    Object.keys(newTeams).forEach(teamId => {
      if (!periodsPerTeam[teamId] || periodsPerTeam[teamId].length === 0) {
        handleAddPeriod(teamId);
      }
    });
    
  }, [fixture, setTeams, setActiveTeamId, initializeTeamPeriods, handleAddPeriod, periodsPerTeam]);
};
