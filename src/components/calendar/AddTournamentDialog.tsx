import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TournamentDialogContent } from "./tournament/TournamentDialogContent";
import { useTournamentForm } from "@/hooks/useTournamentForm";
import { useToast } from "@/hooks/use-toast";

interface TeamPlayerSelection {
  tournament_team_id: string;
  player_id: string;
  position: string;
  is_substitute: boolean;
}

type PlayerSelection = {
  playerId: string;
  position: string;
  is_substitute: boolean;
}

interface AddTournamentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editingTournament?: any;
  showTeamSelection?: boolean;
}

export const AddTournamentDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onSuccess,
  editingTournament,
  showTeamSelection = false,
}: AddTournamentDialogProps) => {
  const { toast } = useToast();
  const [showTeamSelectionState, setShowTeamSelectionState] = useState(showTeamSelection);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [format, setFormat] = useState(editingTournament?.format || "7-a-side");

  const { handleSubmit } = useTournamentForm(
    () => {
      if (!showTeamSelectionState) {
        setShowTeamSelectionState(true);
      } else {
        onSuccess();
        onOpenChange(false);
      }
    },
    editingTournament
  );

  useEffect(() => {
    setShowTeamSelectionState(showTeamSelection);
    if (showTeamSelection && editingTournament) {
      loadExistingTeams(editingTournament.id);
    }
  }, [showTeamSelection, editingTournament]);

  const loadExistingTeams = async (tournamentId: string) => {
    const { data: existingTeams, error } = await supabase
      .from("tournament_teams")
      .select("*")
      .eq("tournament_id", tournamentId);

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

  const handleTeamSelectionsChange = async (selections: Record<string, PlayerSelection[]>) => {
    if (!editingTournament?.id) return;

    try {
      // Delete existing selections
      await supabase
        .from("tournament_team_players")
        .delete()
        .eq("tournament_id", editingTournament.id);

      // Prepare new selections
      const playerSelections: TeamPlayerSelection[] = [];
      
      Object.entries(selections).forEach(([teamId, teamSelections]) => {
        teamSelections.forEach(selection => {
          if (selection.playerId !== "unassigned") {
            playerSelections.push({
              tournament_team_id: teamId,
              player_id: selection.playerId,
              position: selection.position,
              is_substitute: selection.is_substitute
            });
          }
        });
      });

      // Insert new selections if any exist
      if (playerSelections.length > 0) {
        const { error: insertError } = await supabase
          .from("tournament_team_players")
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
      <TournamentDialogContent
        showTeamSelection={showTeamSelectionState}
        editingTournament={editingTournament}
        selectedDate={selectedDate}
        onSubmit={handleSubmit}
        teams={teams}
        format={format}
        onTeamSelectionsChange={handleTeamSelectionsChange}
      />
    </Dialog>
  );
};