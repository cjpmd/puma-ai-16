import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormationSelector } from "./FormationSelector";

interface TeamSelectionManagerProps {
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format: string;
  onTeamSelectionsChange?: (selections: Record<string, Record<string, string>>) => void;
}

export const TeamSelectionManager = ({ 
  teams, 
  format, 
  onTeamSelectionsChange 
}: TeamSelectionManagerProps) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, string>>>({});

  const handleTeamSelectionChange = (teamId: string, selections: Record<string, string>) => {
    const newSelections = {
      ...teamSelections,
      [teamId]: selections
    };
    setTeamSelections(newSelections);
    onTeamSelectionsChange?.(newSelections);
  };

  return (
    <div className="space-y-6">
      {teams.map(team => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormationSelector
              format={format as any}
              teamCategory={team.category}
              onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};