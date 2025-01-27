import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { FestivalDialogContent } from "./festival/FestivalDialogContent";
import { useFestivalForm } from "@/hooks/useFestivalForm";

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
    const { data: existingTeams } = await supabase
      .from("festival_teams")
      .select("*")
      .eq("festival_id", festivalId);

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
      <FestivalDialogContent
        showTeamSelection={showTeamSelectionState}
        editingFestival={editingFestival}
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