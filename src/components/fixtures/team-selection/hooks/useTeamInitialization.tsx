
import { useEffect } from 'react';
import { useTeamSelection } from '../context/TeamSelectionContext';

export const useTeamInitialization = () => {
  const { 
    fixture, 
    setTeams, 
    teams, 
    existingSelectionsLoaded 
  } = useTeamSelection();

  // Initialize teams based on fixture
  useEffect(() => {
    if (fixture && Object.keys(teams).length === 0 && !existingSelectionsLoaded) {
      console.log("Initializing teams for fixture:", fixture);
      
      const newTeams = {};
      const numberOfTeams = fixture.number_of_teams || 1;
      
      // Create team objects based on number of teams in fixture
      for (let i = 0; i < numberOfTeams; i++) {
        const teamId = i.toString();
        newTeams[teamId] = {
          name: `Team ${i + 1}`,
          squadPlayers: []
        };
      }
      
      setTeams(newTeams);
      console.log("Initialized teams:", newTeams);
    }
  }, [fixture, setTeams, teams, existingSelectionsLoaded]);
};
