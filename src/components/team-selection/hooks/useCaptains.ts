
import { useState } from "react";
import { TeamCaptains } from "@/components/fixtures/team-selection/types";

export const useCaptains = () => {
  const [teamCaptains, setTeamCaptains] = useState<TeamCaptains>({});

  // Handler for captain changes
  const handleCaptainChange = (teamId: string, playerId: string) => {
    setTeamCaptains(prev => ({
      ...prev,
      [teamId]: playerId
    }));
  };

  return {
    teamCaptains,
    setTeamCaptains,
    handleCaptainChange
  };
};
