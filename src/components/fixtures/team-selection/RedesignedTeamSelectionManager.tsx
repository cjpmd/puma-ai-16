
import { TeamSelectionProvider } from "./context/TeamSelectionContext";
import { TeamSelectionHeader } from "./components/TeamSelectionHeader";
import { TeamSelectionTabs } from "./components/TeamSelectionTabs";
import { SaveSelectionButton } from "./components/SaveSelectionButton";
import { useTeamInitialization } from "./hooks/useTeamInitialization";
import { useTeamSelectionData } from "./hooks/useTeamSelectionData";
import { TeamSelectionManagerProps } from "./types";

export const RedesignedTeamSelectionManager = ({ fixture, onSuccess }: TeamSelectionManagerProps) => {
  const { isLoading } = useTeamSelectionData(fixture?.id);

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

  return (
    <div className="space-y-6">
      <TeamSelectionHeader />
      <TeamSelectionTabs />
      
      <div className="flex justify-end mt-8">
        <SaveSelectionButton 
          onSuccess={onSuccess} 
          size="lg"
        />
      </div>
    </div>
  );
};
