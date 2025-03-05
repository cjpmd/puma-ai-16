
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceCategory } from "@/types/player";

export const useTeamSelections = (
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>) => void
) => {
  const { toast } = useToast();
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>({});
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, PerformanceCategory>>({});
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});
  const [periodSelections, setPeriodSelections] = useState<Record<string, Record<number, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>>({});

  const handleTeamSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
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

  const handlePeriodSelectionChange = (teamId: string, periodNumber: number, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    setPeriodSelections(prev => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [periodNumber]: selections
      }
    }));
  };

  const handlePerformanceCategoryChange = (teamId: string, category: PerformanceCategory) => {
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
      // Format selections for saving to database
      const formattedSelections = Object.entries(teamSelections).reduce((acc, [teamId, selections]) => {
        acc[teamId] = Object.entries(selections).map(([positionKey, selection]) => ({
          playerId: selection.playerId,
          position: selection.position,
          is_substitute: selection.position.startsWith('sub-'),
          performanceCategory: selection.performanceCategory || performanceCategories[teamId] || 'MESSI' as PerformanceCategory
        }));
        return acc;
      }, {} as Record<string, Array<{ playerId: string; position: string; is_substitute: boolean; performanceCategory?: PerformanceCategory }>>);

      // Example API call - replace with your actual implementation
      console.log("Saving team selections:", formattedSelections);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    periodSelections,
    selectedPlayers,
    performanceCategories,
    teamFormationTemplates,
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    saveSelections
  };
};
