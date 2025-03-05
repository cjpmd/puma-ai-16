
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useTeamSelections = (
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>) => void
) => {
  const { toast } = useToast();
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});

  const handleTeamSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    const newSelections = {
      ...teamSelections,
      [teamId]: selections
    };

    setTeamSelections(newSelections);
    onTeamSelectionsChange?.(newSelections);

    // Update selected players
    const selectedPlayerIds = new Set<string>();
    Object.values(newSelections).forEach(teamSelection => {
      Object.values(teamSelection).forEach(selection => {
        if (selection.playerId !== "unassigned") {
          selectedPlayerIds.add(selection.playerId);
        }
      });
    });
    setSelectedPlayers(selectedPlayerIds);
  };

  const handlePerformanceCategoryChange = (teamId: string, category: string) => {
    setPerformanceCategories(prev => ({
      ...prev,
      [teamId]: category
    }));
    
    // Update existing selections with new performance category
    if (teamSelections[teamId]) {
      const updatedSelections = { ...teamSelections[teamId] };
      
      // Apply the new performance category to all positions in this team
      Object.keys(updatedSelections).forEach(positionKey => {
        updatedSelections[positionKey] = {
          ...updatedSelections[positionKey],
          performanceCategory: category
        };
      });
      
      // Update the team selections
      handleTeamSelectionChange(teamId, updatedSelections);
    }
  };

  const handleTemplateChange = (teamId: string, template: string) => {
    console.log(`Changing template for team ${teamId} to ${template}`);
    setTeamFormationTemplates(prev => ({
      ...prev,
      [teamId]: template
    }));
  };

  const saveSelections = async () => {
    try {
      // Save team selections logic here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      toast({
        title: "Success",
        description: "Team selections saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selections",
      });
      return false;
    }
  };

  return {
    teamSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    handleTeamSelectionChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    saveSelections
  };
};
