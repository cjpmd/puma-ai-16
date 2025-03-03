
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Fixture } from "@/types/fixture";

interface TeamSelectionContextType {
  teams: Record<string, { name: string; squadPlayers: string[] }>;
  setTeams: React.Dispatch<React.SetStateAction<Record<string, { name: string; squadPlayers: string[] }>>>;
  teamCaptains: Record<string, string>;
  setTeamCaptains: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selections: Record<string, Record<string, Record<string, Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>>>;
  setSelections: React.Dispatch<React.SetStateAction<Record<string, Record<string, Record<string, Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>>>>>; 
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  handleSquadSelection: (teamId: string, playerIds: string[]) => void;
  handleCaptainChange: (teamId: string, playerId: string) => void;
  handleFormationChange: (teamId: string, halfId: string, periodId: string, newSelections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
  getPlayerTeams: (playerId: string) => string[];
  convertToSaveFormat: () => {
    allSelections: any;
    periodsPerTeam: any;
    teamCaptains: any;
  };
  fixture: Fixture | null;
}

const TeamSelectionContext = createContext<TeamSelectionContextType | undefined>(undefined);

export const useTeamSelection = () => {
  const context = useContext(TeamSelectionContext);
  if (!context) {
    throw new Error("useTeamSelection must be used within a TeamSelectionProvider");
  }
  return context;
};

interface TeamSelectionProviderProps {
  children: ReactNode;
  fixture: Fixture | null;
}

export const TeamSelectionProvider = ({ children, fixture }: TeamSelectionProviderProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const [teams, setTeams] = useState<Record<string, { name: string; squadPlayers: string[] }>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, Record<string, { playerId: string; position: string; isSubstitution?: boolean }>>>>>({}); 

  // Handle squad selection
  const handleSquadSelection = useCallback((teamId: string, playerIds: string[]) => {
    console.log(`Squad selection for team ${teamId}:`, playerIds);
    setTeams(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        squadPlayers: playerIds
      }
    }));
  }, []);

  // Handle captain selection
  const handleCaptainChange = useCallback((teamId: string, playerId: string) => {
    console.log(`Captain change for team ${teamId} to player ${playerId}`);
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  }, []);

  // Handle formation changes
  const handleFormationChange = useCallback((teamId: string, halfId: string, periodId: string, newSelections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => {
    console.log(`Formation change for team ${teamId}, half ${halfId}, period ${periodId}:`, newSelections);
    
    setSelections(prev => {
      const updated = { ...prev };
      
      // Initialize the structures if they don't exist
      if (!updated[teamId]) updated[teamId] = {};
      if (!updated[teamId][halfId]) updated[teamId][halfId] = {};
      if (!updated[teamId][halfId][periodId]) updated[teamId][halfId][periodId] = {};
      
      // Update the selections
      updated[teamId][halfId][periodId] = newSelections;
      
      return updated;
    });
  }, []);

  // Get which teams a player is in
  const getPlayerTeams = useCallback((playerId: string): string[] => {
    return Object.entries(teams)
      .filter(([_, team]) => team.squadPlayers.includes(playerId))
      .map(([teamId]) => teamId);
  }, [teams]);

  // Convert the new structure to the format expected by useTeamSelectionSave
  const convertToSaveFormat = useCallback(() => {
    console.log("Converting to save format. Current selections:", selections);
    
    // Create the converted data structure
    const allSelections = {};
    const periodsPerTeam = {};
    
    // Process each team
    Object.keys(selections).forEach(teamId => {
      if (!selections[teamId]) return;
      
      // Process each half
      Object.keys(selections[teamId]).forEach(halfId => {
        if (!selections[teamId][halfId]) return;
        
        // Process each period in the half
        Object.keys(selections[teamId][halfId]).forEach(periodId => {
          if (!selections[teamId][halfId][periodId]) return;
          
          // Create period ID for the save format
          const formattedPeriodId = `${halfId}-${periodId}`;
          
          // Initialize the period if it doesn't exist
          if (!allSelections[formattedPeriodId]) {
            allSelections[formattedPeriodId] = {};
          }
          
          // Initialize the team if it doesn't exist
          const adjustedTeamId = (parseInt(teamId) + 1).toString(); // Team IDs are 1-indexed in the save format
          if (!allSelections[formattedPeriodId][adjustedTeamId]) {
            allSelections[formattedPeriodId][adjustedTeamId] = {};
          }
          
          // Add selections for this team/period
          const selectionData = {};
          
          // Convert each selection to include the proper position and performance category
          Object.entries(selections[teamId][halfId][periodId]).forEach(([slotId, selection]) => {
            selectionData[slotId] = {
              playerId: selection.playerId,
              position: selection.position,
              performanceCategory: "MESSI" // Default if not specified
            };
          });
          
          allSelections[formattedPeriodId][adjustedTeamId] = selectionData;
          
          // Add period to periodsPerTeam
          if (!periodsPerTeam[adjustedTeamId]) {
            periodsPerTeam[adjustedTeamId] = [];
          }
          
          // Add period with duration (assuming 20 minutes by default)
          const periodExists = periodsPerTeam[adjustedTeamId].some(p => p.id === formattedPeriodId);
          if (!periodExists) {
            periodsPerTeam[adjustedTeamId].push({
              id: formattedPeriodId,
              duration: 20 // Default duration
            });
          }
        });
      });
    });
    
    // Convert team captains (also 1-indexed in save format)
    const adjustedTeamCaptains = {};
    Object.keys(teamCaptains).forEach(teamId => {
      if (teamCaptains[teamId]) {
        const adjustedTeamId = (parseInt(teamId) + 1).toString();
        adjustedTeamCaptains[adjustedTeamId] = teamCaptains[teamId];
      }
    });
    
    console.log("Save format data:", {
      allSelections,
      periodsPerTeam,
      teamCaptains: adjustedTeamCaptains
    });
    
    return {
      allSelections,
      periodsPerTeam,
      teamCaptains: adjustedTeamCaptains
    };
  }, [selections, teamCaptains]);

  const value = {
    teams,
    setTeams,
    teamCaptains,
    setTeamCaptains,
    selections,
    setSelections,
    activeTab,
    setActiveTab,
    handleSquadSelection,
    handleCaptainChange,
    handleFormationChange,
    getPlayerTeams,
    convertToSaveFormat,
    fixture
  };

  return (
    <TeamSelectionContext.Provider value={value}>
      {children}
    </TeamSelectionContext.Provider>
  );
};
