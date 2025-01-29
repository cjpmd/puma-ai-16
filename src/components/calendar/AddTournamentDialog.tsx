import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TournamentDialogContent } from "./tournament/TournamentDialogContent";
import { useTournamentForm } from "@/hooks/useTournamentForm";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

type Tournament = Database["public"]["Tables"]["tournaments"]["Row"];

type TeamSelections = Record<string, Array<{
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}>>;

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
  const navigate = useNavigate();
  const [showTeamSelectionState, setShowTeamSelectionState] = useState(showTeamSelection);
  const [teams, setTeams] = useState<Team[]>([]);
  const [format, setFormat] = useState<string>(editingTournament?.format || "7-a-side");

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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to manage tournaments",
        });
        navigate("/auth");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

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
      // First delete existing selections
      await supabase
        .from("tournament_team_players")
        .delete()
        .eq("tournament_id", editingTournament.id);

      // Prepare player selections for insertion
      const playerSelections = Object.entries(selections).flatMap(([teamId, players]) =>
        players.map((player) => ({
          tournament_team_id: teamId,
          player_id: player.playerId,
          position: player.position,
          is_substitute: player.is_substitute,
          performance_category: player.performanceCategory || "MESSI",
        }))
      );

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
      console.error("Error updating team selections:", error);
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