
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { Save } from "lucide-react";

interface SaveSelectionButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const SaveSelectionButton = ({ onSuccess, className = "" }: SaveSelectionButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { convertToSaveFormat } = useTeamSelection();
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Get the selection data in the format expected by the save function
      const { allSelections, periodsPerTeam, teamCaptains } = convertToSaveFormat();
      
      console.log("Team selections ready to save:", {
        allSelections,
        periodsPerTeam,
        teamCaptains
      });
      
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving team selections:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSave} 
      disabled={isSaving}
      className={className}
    >
      {isSaving ? (
        <>Saving...</>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Save Team Selection
        </>
      )}
    </Button>
  );
};
