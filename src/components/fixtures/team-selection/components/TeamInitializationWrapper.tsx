
import { useEffect } from "react";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamInitialization } from "../hooks/useTeamInitialization";
import { usePeriods } from "../hooks/usePeriods";

export const TeamInitializationWrapper = () => {
  const { fixture, setTeams, setActiveTeamId } = useTeamSelection();
  const { initializeTeamPeriods } = usePeriods();
  
  // Use the initialization hook for team setup
  useTeamInitialization();
  
  useEffect(() => {
    // Log the initialization process
    console.log("TeamInitializationWrapper rendered with fixture:", fixture);
  }, [fixture]);
  
  return null; // This is a utility component that doesn't render anything
};
