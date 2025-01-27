import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { TournamentDialogContent } from "./tournament/TournamentDialogContent";
import { useTournamentForm } from "@/hooks/useTournamentForm";

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
  const [showTeamSelectionState, setShowTeamSelectionState] = useState(showTeamSelection);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; category: string }>>([]);
  const [format, setFormat] = useState(editingTournament?.format || "7-a-side");

  const { handleSubmit } = useTournamentForm(
    () => {
      if (!showTeamSelectionState) {
        setShowTeamSelectionState(true);
      } else {
        onSuccess();
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
    const { data: existingTeams } = await supabase
      .from("tournament_teams")
      .select("*")
      .eq("tournament_id", tournamentId);

    if (existingTeams) {
      setTeams(existingTeams.map(team => ({
        id: team.id,
        name: team.team_name,
        category: team.category || "",
      })));
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
        onTeamSelectionsChange={(selections) => {
          console.log("Team selections:", selections);
        }}
      />
    </Dialog>
  );
};