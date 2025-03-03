
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamSelectionSave } from "../hooks/useTeamSelectionSave";
import { SaveIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface SaveSelectionButtonProps {
  onSuccess?: () => void;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const SaveSelectionButton = ({ 
  onSuccess, 
  size = "default",
  className
}: SaveSelectionButtonProps) => {
  const { toast } = useToast();
  const { fixture, convertToSaveFormat } = useTeamSelection();
  const queryClient = useQueryClient();
  const [preventMultipleClicks, setPreventMultipleClicks] = useState(false);
  
  // Convert the structure for saving
  const saveData = convertToSaveFormat();
  
  // Initialize save hook with our converted data
  const { isSaving, handleSave } = useTeamSelectionSave(
    fixture?.id,
    saveData.allSelections,
    saveData.periodsPerTeam,
    saveData.teamCaptains,
    onSuccess
  );

  // Save all selections
  const handleSaveSelections = async () => {
    if (preventMultipleClicks) {
      console.log("Preventing multiple save clicks");
      return;
    }
    
    try {
      setPreventMultipleClicks(true);
      console.log("SaveSelectionButton: Starting save operation with data:", saveData);
      const result = await handleSave();
      
      if (result) {
        // Invalidate queries to ensure updated data is fetched
        if (fixture?.id) {
          console.log("SaveSelectionButton: Invalidating queries for fixture:", fixture.id);
          
          // Invalidate the specific fixture selections
          await queryClient.invalidateQueries({ 
            queryKey: ["fixture-selections", fixture.id] 
          });
          
          // Also invalidate calendar data to update UI
          await queryClient.invalidateQueries({
            queryKey: ["fixtures"]
          });
          
          await queryClient.invalidateQueries({
            queryKey: ["calendar-data"]
          });
          
          // If the fixture has a date, also invalidate that specific date's fixtures
          if (fixture.date) {
            await queryClient.invalidateQueries({
              queryKey: ["fixtures", fixture.date]
            });
          }
        }
        
        toast({
          title: "Success",
          description: "Team selections saved successfully",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save team selections: ${error.message || "Unknown error"}`,
      });
    } finally {
      // Allow clicking again after a short delay to prevent accidental double-clicks
      setTimeout(() => {
        setPreventMultipleClicks(false);
      }, 1000);
    }
  };

  // Don't render if there's no fixture
  if (!fixture) return null;

  return (
    <Button 
      onClick={handleSaveSelections} 
      disabled={isSaving || preventMultipleClicks}
      size={size}
      className={className}
    >
      {isSaving ? 'Saving...' : (
        <>
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Selections
        </>
      )}
    </Button>
  );
};
