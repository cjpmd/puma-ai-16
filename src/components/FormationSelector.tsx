
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormationView } from "@/components/fixtures/FormationView";
import { SubstitutesList } from "./formation/SubstitutesList";
import { FormationSlots } from "./formation/FormationSlots";
import { useFormationSelections } from "./formation/hooks/useFormationSelections";
import { formatSelectionsForFormation } from "./formation/utils/selectionFormatUtils";
import { FormationSelectionProps } from "./formation/types";
import { FormationTemplateSelector } from "./formation/FormationTemplateSelector";

export const FormationSelector: React.FC<FormationSelectionProps> = ({
  format,
  teamName,
  onSelectionChange,
  selectedPlayers,
  availablePlayers: initialPlayers,
  performanceCategory = "MESSI",
  initialSelections,
  viewMode = "team-sheet",
  duration = 20,
  periodNumber = 1,
  formationTemplate
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(formationTemplate || "All");
  const { selections, localPerformanceCategory, handlePlayerSelection } = useFormationSelections({
    initialSelections,
    performanceCategory,
    onSelectionChange
  });

  const { data: fetchedPlayers } = useQuery({
    queryKey: ["available-players", teamName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !initialPlayers,
  });

  const players = initialPlayers || fetchedPlayers || [];

  const handleTemplateChange = (template: string) => {
    console.log(`Formation template changed to: ${template}`);
    setSelectedTemplate(template);
  };

  // Adapter function to handle the selection change with the correct parameters
  const handleSelectionChange = (slotId: string, playerId: string) => {
    handlePlayerSelection(slotId, playerId, selections[slotId]?.position || slotId);
  };

  if (viewMode === "formation") {
    return (
      <FormationView
        positions={formatSelectionsForFormation(selections)}
        players={players.map(player => ({
          id: player.id,
          name: player.name,
          squad_number: player.squad_number || 0,
          age: 0,
          dateOfBirth: new Date().toISOString(),
          playerType: "OUTFIELD",
          attributes: []
        }))}
        periodNumber={periodNumber}
        duration={duration}
      />
    );
  }

  return (
    <div className="space-y-4">
      <FormationTemplateSelector
        format={format}
        selectedTemplate={selectedTemplate}
        onTemplateChange={handleTemplateChange}
      />
      
      <FormationSlots
        format={format}
        selections={selections}
        availablePlayers={players}
        onPlayerSelection={handleSelectionChange}
        selectedPlayers={selectedPlayers}
        formationTemplate={selectedTemplate}
      />

      <SubstitutesList
        maxSubstitutes={format === "11-a-side" ? 5 : 3}
        selections={selections}
        availablePlayers={players}
        onSelectionChange={handleSelectionChange}
        selectedPlayers={selectedPlayers}
      />
    </div>
  );
};
