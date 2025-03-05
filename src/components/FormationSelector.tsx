
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormationView } from "@/components/fixtures/FormationView";
import { SubstitutesList } from "./formation/SubstitutesList";
import { FormationSlots } from "./formation/FormationSlots";
import { useFormationSelections } from "./formation/hooks/useFormationSelections";
import { formatSelectionsForFormation } from "./formation/utils/formationUtils";
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
  periodNumber = 1
}) => {
  const [formationTemplate, setFormationTemplate] = useState<string>("All");
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
    setFormationTemplate(template);
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
        selectedTemplate={formationTemplate}
        onTemplateChange={handleTemplateChange}
      />
      
      <FormationSlots
        format={format}
        selections={selections}
        availablePlayers={players}
        onPlayerSelection={handlePlayerSelection}
        selectedPlayers={selectedPlayers}
        formationTemplate={formationTemplate}
      />

      <SubstitutesList
        maxSubstitutes={format === "11-a-side" ? 5 : 3}
        selections={selections}
        availablePlayers={players}
        onSelectionChange={handlePlayerSelection}
        selectedPlayers={selectedPlayers}
      />
    </div>
  );
};
