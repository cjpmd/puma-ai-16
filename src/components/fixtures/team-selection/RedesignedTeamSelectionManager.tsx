
import { useEffect } from "react";
import { TeamSelectionProvider } from "./context/TeamSelectionContext";
import { TeamSelectionHeader } from "./components/TeamSelectionHeader";
import { TeamSelectionTabs } from "./components/TeamSelectionTabs";
import { SaveSelectionButton } from "./components/SaveSelectionButton";
import { useTeamInitialization } from "./hooks/useTeamInitialization";
import { useTeamSelectionData } from "./hooks/useTeamSelectionData";
import { TeamSelectionManagerProps } from "./types";
import { useToast } from "@/hooks/use-toast";

export const RedesignedTeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const { isLoading } = useTeamSelectionData(fixture?.id);
  const { toast } = useToast();

  // Show a message if fixture is missing
  if (!fixture) {
    return <div className="p-4 text-center">No fixture data available</div>;
  }

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading team selection data...</span>
    </div>;
  }

  return (
    <TeamSelectionProvider fixture={fixture}>
      <TeamSelectionContent onSuccess={onSuccess} />
    </TeamSelectionProvider>
  );
};

const TeamSelectionContent = ({ onSuccess }: { onSuccess?: () => void }) => {
  // Initialize teams when fixture changes
  useTeamInitialization();
  const { toast } = useToast();

  useEffect(() => {
    // Log that the component mounted successfully
    console.log("TeamSelectionContent component mounted");
  }, []);

  return (
    <div className="space-y-6">
      <TeamSelectionHeader />
      <TeamSelectionTabs />
      
      <div className="flex justify-end mt-8">
        <SaveSelectionButton 
          onSuccess={onSuccess} 
          className="px-6 py-2"
        />
      </div>
    </div>
  );
};
