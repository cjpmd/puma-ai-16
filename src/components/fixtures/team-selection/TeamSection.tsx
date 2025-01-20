import { useState } from "react";
import { FormationView } from "../FormationView";
import { PeriodTable } from "./PeriodTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TeamSectionProps {
  teamIndex: number;
  teamName: string;
  format: string;
  category: string;
  players: any[];
  onCategoryChange: (index: number, category: string) => void;
  availableCategories: string[];
}

export const TeamSection = ({
  teamIndex,
  teamName,
  format,
  category,
  players,
  onCategoryChange,
  availableCategories,
}: TeamSectionProps) => {
  const [positions, setPositions] = useState<any[]>([]);
  const [showFormation, setShowFormation] = useState(false);

  // Filter players based on team category
  const filteredPlayers = players.filter(player => 
    player.player_category === category || player.team_category === category
  );

  const getPositionsForFormat = (format: string) => {
    const formatPositions: { [key: string]: { abbreviation: string; full_name: string }[] } = {
      "4-a-side": [
        { abbreviation: "GK", full_name: "Goalkeeper" },
        { abbreviation: "D", full_name: "Defender" },
        { abbreviation: "M", full_name: "Midfielder" },
        { abbreviation: "ST", full_name: "Striker" }
      ],
      "5-a-side": [
        { abbreviation: "GK", full_name: "Goalkeeper" },
        { abbreviation: "DL", full_name: "Left Defender" },
        { abbreviation: "DR", full_name: "Right Defender" },
        { abbreviation: "M", full_name: "Midfielder" },
        { abbreviation: "ST", full_name: "Striker" }
      ],
      "7-a-side": [
        { abbreviation: "GK", full_name: "Goalkeeper" },
        { abbreviation: "DL", full_name: "Left Defender" },
        { abbreviation: "DCR", full_name: "Central Defender" },
        { abbreviation: "DR", full_name: "Right Defender" },
        { abbreviation: "ML", full_name: "Left Midfielder" },
        { abbreviation: "MR", full_name: "Right Midfielder" },
        { abbreviation: "ST", full_name: "Striker" }
      ],
      "9-a-side": [
        { abbreviation: "GK", full_name: "Goalkeeper" },
        { abbreviation: "DL", full_name: "Left Defender" },
        { abbreviation: "DC", full_name: "Central Defender" },
        { abbreviation: "DR", full_name: "Right Defender" },
        { abbreviation: "ML", full_name: "Left Midfielder" },
        { abbreviation: "MC", full_name: "Central Midfielder" },
        { abbreviation: "MR", full_name: "Right Midfielder" },
        { abbreviation: "AMC", full_name: "Attacking Midfielder" },
        { abbreviation: "ST", full_name: "Striker" }
      ],
      "11-a-side": [
        { abbreviation: "GK", full_name: "Goalkeeper" },
        { abbreviation: "DL", full_name: "Left Back" },
        { abbreviation: "DCL", full_name: "Left Center Back" },
        { abbreviation: "DCR", full_name: "Right Center Back" },
        { abbreviation: "DR", full_name: "Right Back" },
        { abbreviation: "ML", full_name: "Left Midfielder" },
        { abbreviation: "MC", full_name: "Central Midfielder" },
        { abbreviation: "MR", full_name: "Right Midfielder" },
        { abbreviation: "AML", full_name: "Left Winger" },
        { abbreviation: "ST", full_name: "Striker" },
        { abbreviation: "AMR", full_name: "Right Winger" }
      ]
    };

    return formatPositions[format] || [];
  };

  return (
    <div className="space-y-4 border p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{teamName}</h3>
        <div className="flex items-center gap-4">
          <div className="w-[200px]">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value) => onCategoryChange(teamIndex, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {showFormation && (
        <FormationView
          positions={positions}
          players={filteredPlayers}
          periodNumber={teamIndex + 1}
          duration={0}
        />
      )}

      <PeriodTable
        periods={[{
          id: `team-${teamIndex}`,
          start_minute: 0,
          duration_minutes: 0,
          positions: positions,
          substitutes: []
        }]}
        positions={getPositionsForFormat(format)}
        players={filteredPlayers}
        format={format}
        onPositionChange={() => {}}
        onPlayerChange={(_, posIndex, playerId) => {
          const newPositions = [...positions];
          newPositions[posIndex] = { ...newPositions[posIndex], playerId };
          setPositions(newPositions);
        }}
        onSubstituteChange={() => {}}
        onDurationChange={() => {}}
        onRemovePeriod={() => {}}
      />
    </div>
  );
};