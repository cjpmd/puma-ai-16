import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PositionSelect } from "@/components/formation/PlayerPositionSelect";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Player } from "@/types/player";

// Replace the import with a local implementation
const transformDbPlayerToPlayer = (dbPlayer: any): Partial<Player> => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    squad_number: dbPlayer.squad_number,
    player_type: dbPlayer.player_type,
    team_category: dbPlayer.team_category,
  };
};

interface TournamentTeamSelectionProps {
  tournamentId: string;
  onPlayersSelected: (players: any[]) => void;
}

export const TournamentTeamSelection = ({ tournamentId, onPlayersSelected }: TournamentTeamSelectionProps) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching players:", error);
          return;
        }

        // Transform database players to internal player format
        const transformedPlayers = data.map(transformDbPlayerToPlayer);
        setPlayers(transformedPlayers);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const togglePlayerSelection = (player: any) => {
    const alreadySelected = selectedPlayers.some((p) => p.id === player.id);

    if (alreadySelected) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  useEffect(() => {
    onPlayersSelected(selectedPlayers);
  }, [selectedPlayers, onPlayersSelected]);

  if (loading) {
    return <div>Loading players...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Players for Tournament</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div key={player.id} className="border rounded-md p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor={`player-${player.id}`} className="cursor-pointer">
                {player.name}
              </Label>
              <Checkbox
                id={`player-${player.id}`}
                checked={selectedPlayers.some((p) => p.id === player.id)}
                onCheckedChange={() => togglePlayerSelection(player)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
