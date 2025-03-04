
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { useTeamSelectionSave } from "../hooks/useTeamSelectionSave";
import { usePeriods } from "../hooks/usePeriods";
import { useProcessSelections } from "../hooks/useProcessSelections";

interface SaveSelectionButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const SaveSelectionButton = ({ onSuccess, className }: SaveSelectionButtonProps) => {
  const { fixture, convertToSaveFormat } = useTeamSelection();
  const { processSelections } = useProcessSelections();
  const { periodsPerTeam } = usePeriods();
  const { teamCaptains } = useTeamSelection();
  
  // Get the formatted data for saving
  const { allSelections, periodsPerTeam: formattedPeriodsPerTeam, teamCaptains: formattedTeamCaptains } = convertToSaveFormat();
  
  const { isSaving, handleSave } = useTeamSelectionSave(
    fixture?.id,
    allSelections,
    formattedPeriodsPerTeam,
    formattedTeamCaptains,
    onSuccess
  );

  const onSaveClick = async () => {
    const success = await handleSave();
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Button 
      className={className}
      disabled={isSaving} 
      onClick={onSaveClick}
    >
      {isSaving ? "Saving..." : "Save Team Selection"}
    </Button>
  );
};
