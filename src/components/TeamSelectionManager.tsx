import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormationSelector } from "./FormationSelector";
import { FormationView } from "./fixtures/FormationView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamSelectionManagerProps {
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format: "4-a-side" | "5-a-side" | "6-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
  onTeamSelectionsChange?: (selections: Record<string, Record<string, string>>) => void;
}

export const TeamSelectionManager = ({ 
  teams, 
  format, 
  onTeamSelectionsChange 
}: TeamSelectionManagerProps) => {
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, string>>>({});
  const [showFormations, setShowFormations] = useState(false);
  const [teamCategories, setTeamCategories] = useState<Record<string, string>>({});

  const { data: players } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleTeamSelectionChange = (teamId: string, selections: Record<string, string>) => {
    const newSelections = {
      ...teamSelections,
      [teamId]: selections
    };
    setTeamSelections(newSelections);
    onTeamSelectionsChange?.(newSelections);
  };

  const handleCategoryChange = (teamId: string, category: string) => {
    setTeamCategories(prev => ({
      ...prev,
      [teamId]: category
    }));
  };

  const formatSelectionsForFormation = (selections: Record<string, string>) => {
    return Object.entries(selections)
      .filter(([key]) => !key.startsWith('sub-'))
      .map(([key, playerId]) => ({
        position: key.split('-')[0].toUpperCase(),
        playerId
      }));
  };

  return (
    <div className="space-y-6">
      <Button 
        onClick={() => setShowFormations(!showFormations)}
        className="mb-4"
      >
        {showFormations ? "Hide Formations" : "Show Formations"}
      </Button>

      {teams.map(team => (
        <Card key={team.id}>
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {showFormations && teamSelections[team.id] && (
              <FormationView
                positions={formatSelectionsForFormation(teamSelections[team.id])}
                players={players || []}
                periodNumber={1}
                duration={20}
              />
            )}
            <FormationSelector
              format={format}
              teamCategory={team.category}
              onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
              onCategoryChange={(category) => handleCategoryChange(team.id, category)}
              performanceCategory={teamCategories[team.id]}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};