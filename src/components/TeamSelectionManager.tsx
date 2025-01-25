import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Card>
      <CardHeader>
        <CardTitle>Team Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={teams[0]?.id}>
          <TabsList className="w-full">
            {teams.map(team => (
              <TabsTrigger key={team.id} value={team.id} className="flex-1">
                {team.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {teams.map(team => (
            <TabsContent key={team.id} value={team.id}>
              <FormationSelector
                format={format as any}
                teamCategory={team.category}
                onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};