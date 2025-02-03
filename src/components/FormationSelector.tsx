import { useState, useEffect } from "react";
import { PlayerPositionSelect } from "./formation/PlayerPositionSelect";
import { SubstitutesList } from "./formation/SubstitutesList";
import { TeamSettingsHeader } from "./formation/TeamSettingsHeader";

interface FormationSelectorProps {
  format: "4-a-side" | "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  teamName: string;
  onSelectionChange: (selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => void;
  selectedPlayers: Set<string>;
  availablePlayers: Array<{
    id: string;
    name: string;
    squad_number?: number;
  }>;
}

export const FormationSelector = ({
  format,
  teamName,
  onSelectionChange,
  selectedPlayers,
  availablePlayers,
}: FormationSelectorProps) => {
  const [positions, setPositions] = useState<string[]>([]);
  const [selections, setSelections] = useState<Record<string, { playerId: string; position: string; performanceCategory?: string }>>({});

  useEffect(() => {
    // Initialize positions based on the format
    switch (format) {
      case "4-a-side":
        setPositions(["GK", "DEF", "MID", "FWD"]);
        break;
      case "5-a-side":
        setPositions(["GK", "DEF", "DEF", "MID", "FWD"]);
        break;
      case "7-a-side":
        setPositions(["GK", "DEF", "DEF", "MID", "MID", "FWD", "FWD"]);
        break;
      case "9-a-side":
        setPositions(["GK", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]);
        break;
      case "11-a-side":
        setPositions(["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD", "FWD"]);
        break;
      default:
        setPositions([]);
    }
  }, [format]);

  const handlePlayerSelection = (position: string, playerId: string) => {
    const newSelections = {
      ...selections,
      [position]: { playerId, position, performanceCategory: "MESSI" },
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  return (
    <div className="space-y-6">
      <TeamSettingsHeader 
        captain=""
        duration="90"
        onCaptainChange={() => {}}
        onDurationChange={() => {}}
        availablePlayers={availablePlayers}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {positions.map((position) => (
          <PlayerPositionSelect
            key={position}
            slotId={position}
            position={position}
            playerId={selections[position]?.playerId || "unassigned"}
            availablePlayers={availablePlayers}
            onSelectionChange={(playerId, pos) => handlePlayerSelection(position, playerId)}
            selectedPlayers={selectedPlayers}
          />
        ))}
      </div>

      <SubstitutesList
        maxSubstitutes={5}
        selections={{}}
        availablePlayers={availablePlayers}
        onSelectionChange={() => {}}
        selectedPlayers={selectedPlayers}
      />
    </div>
  );
};