import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fixture } from "@/types/fixture";
import { Badge } from "../ui/badge";

interface TeamSelectionManagerProps {
  fixture: Fixture;
  onSave?: (selectedPlayers: string[], captainId: string | null) => void;
}

export const TeamSelectionManager = ({ fixture, onSave }: TeamSelectionManagerProps) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);

  const { data: availablePlayers } = useQuery({
    queryKey: ["available-players", fixture.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_category", fixture.category);

      if (error) throw error;
      return data;
    },
  });

  const { data: existingSelections } = useQuery({
    queryKey: ["team-selections", fixture.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_team_selections")
        .select("*")
        .eq("fixture_id", fixture.id);

      if (error) throw error;
      return data;
    },
    meta: {
      onSettled: (data) => {
        if (data) {
          setSelectedPlayers(data.map((selection) => selection.player_id));
          const captain = data.find((selection) => selection.is_captain);
          if (captain) {
            setCaptainId(captain.player_id);
          }
        }
      }
    }
  });

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((current) => {
      if (current.includes(playerId)) {
        // If removing the captain, clear captain selection
        if (playerId === captainId) {
          setCaptainId(null);
        }
        return current.filter((id) => id !== playerId);
      }
      return [...current, playerId];
    });
  };

  const handleCaptainToggle = (playerId: string) => {
    setCaptainId((current) => (current === playerId ? null : playerId));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(selectedPlayers, captainId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {availablePlayers?.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between space-x-4 p-2 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    id={`player-${player.id}`}
                    checked={selectedPlayers.includes(player.id)}
                    onCheckedChange={() => handlePlayerToggle(player.id)}
                  />
                  <div>
                    <Label htmlFor={`player-${player.id}`} className="font-medium">
                      {player.name} - #{player.squad_number}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{player.player_type}</Badge>
                    </div>
                  </div>
                </div>
                {selectedPlayers.includes(player.id) && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`captain-${player.id}`}
                      checked={captainId === player.id}
                      onCheckedChange={() => handleCaptainToggle(player.id)}
                    />
                    <Label htmlFor={`captain-${player.id}`}>Captain</Label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>Save Selection</Button>
        </div>
      </CardContent>
    </Card>
  );
};