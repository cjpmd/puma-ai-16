
import { useEffect } from "react";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamInitialization } from "../hooks/useTeamInitialization";

export const TeamInitializationWrapper = () => {
  // Use the initialization hook
  useTeamInitialization();
  
  return null; // This is a utility component that doesn't render anything
};
