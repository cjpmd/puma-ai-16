import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { FestivalDialogContent } from "./festival/FestivalDialogContent";
import { useFestivalForm } from "@/hooks/useFestivalForm";
import { useToast } from "@/hooks/use-toast";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}

interface AddFestivalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editingFestival?: any;
  showTeamSelection?: boolean;
}

export const AddFestivalDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onSuccess,
  editingFestival,
  showTeamSelection = false,
}: AddFestivalDialogProps) => {
  const { toast } = useToast();
  const [showTeamSelectionState, setShowTeamSelectionState] = useState(showTeamSelection);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [format, setFormat] = useState(editingFestival?.format || "7-a-side");

  const { handleSubmit } = useFestivalForm(
    () => {
      if (!showTeamSelectionState) {
        setShowTeamSelectionState(true);
      } else {
        onSuccess();
      }
    },
    editingFestival
  );

  useEffect(() => {
    setShowTeamSelectionState(showTeamSelection);
    if (showTeamSelection && editingFestival) {
      loadExistingTeams(editingFestival.id);
    }
  }, [showTeamSelection, editingFestival]);

  const loadExistingTeams = async (festivalId: string) => {
    const { data: existingTeams, error } = await supabase
      .from("festival_teams")
      .select("*")
      .eq("festival_id", festivalId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load existing teams",
      });
      return;
    }

    if (existingTeams) {
      setTeams(existingTeams.map(team => ({
        id: team.id,
        name: team.team_name,
        category: team.category || "",
      })));
    }
  };

  const handleTeamSelectionsChange = async (selections: Record<string, TeamSelection[]>) => {
    if (!editingFestival?.id) return;

    try {
      // Delete existing selections by festival_team_id
      for (const teamId of Object.keys(selections)) {
        await supabase
          .from("festival_team_players")
          .delete()
          .eq("festival_team_id", teamId);
      }

      // Format selections for database
      const playerSelections = Object.entries(selections).flatMap(([teamId, teamSelections]) =>
        teamSelections.map(selection => ({
          festival_team_id: teamId,
          player_id: selection.playerId,
          position: selection.position,
          is_substitute: selection.is_substitute,
          performance_category: selection.performanceCategory
        }))
      );

      // Insert new selections
      if (playerSelections.length > 0) {
        const { error: insertError } = await supabase
          .from("festival_team_players")
          .insert(playerSelections);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Team selections updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update team selections",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <FestivalDialogContent
        showTeamSelection={showTeamSelectionState}
        editingFestival={editingFestival}
        selectedDate={selectedDate}
        onSubmit={handleSubmit}
        teams={teams}
        format={format}
        onTeamSelectionsChange={handleTeamSelectionsChange}
      />
    </Dialog>
  );
};