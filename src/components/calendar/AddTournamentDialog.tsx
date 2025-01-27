import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TournamentDialogContent } from "./tournament/TournamentDialogContent";
import { useTournamentForm } from "@/hooks/useTournamentForm";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  category: string;
}

// Define explicit interface for tournament team player data
interface TournamentTeamPlayer {
  tournament_team_id: string;
  player_id: string;
  position: string;
  is_substitute: boolean;
}

// Simple type for position-to-player mapping
type PositionMapping = {
  [position: string]: string;
};

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
      setTeams(existingTeams.map(team => ({
        id: team.id,
        name: team.team_name,
        category: team.category || "",
      })));
    }
  };

  const handleTeamSelectionsChange = async (selections: Record<string, PositionMapping>) => {
    if (!editingTournament?.id) return;

    try {
      await supabase
        .from("tournament_team_players")
        .delete()
        .eq("tournament_id", editingTournament.id);

      const insertData: TournamentTeamPlayer[] = Object.entries(selections).flatMap(([teamId, playerSelections]) =>
        Object.entries(playerSelections)
          .filter(([_, playerId]) => playerId !== "unassigned")
          .map(([position, playerId]) => ({
            tournament_team_id: teamId,
            player_id: playerId,
            position: position.split('-')[0],
            is_substitute: position.startsWith('sub-')
          }))
      );

      if (insertData.length > 0) {
        const { error: insertError } = await supabase
          .from("tournament_team_players")
          .insert(insertData);

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