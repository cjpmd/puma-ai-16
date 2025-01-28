import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TournamentDialogContent } from "./tournament/TournamentDialogContent";
import { useTournamentForm } from "@/hooks/useTournamentForm";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}

interface TeamSelections {
  [teamId: string]: Array<TeamSelection>;
}

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

interface Team {
  id: string;
  name: string;
  category: string;
}

interface AddTournamentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editingTournament?: Tournament | null;
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
  const [teams, setTeams] = useState<Team[]>([]);
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
      setTeams(
        existingTeams.map((team) => ({
          id: team.id,
          name: team.team_name,
          category: team.category || "",
        }))
      );
    }
  };

  const handleTeamSelectionsChange = async (selections: TeamSelections) => {
    if (!editingTournament?.id) return;

    try {
      await supabase
        .from("tournament_team_players")
        .delete()
        .eq("tournament_id", editingTournament.id);

      const playerSelections = Object.entries(selections).map(([teamId, teamSelections]) => 
        teamSelections.map((selection) => ({
          tournament_team_id: teamId,
          player_id: selection.playerId,
          position: selection.position,
          is_substitute: selection.is_substitute,
          performance_category: selection.performanceCategory || "MESSI",
        }))
      ).flat();

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