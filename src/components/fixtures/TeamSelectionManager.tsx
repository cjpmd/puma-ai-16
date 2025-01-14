import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus } from "lucide-react";

interface TeamSelectionManagerProps {
  fixtureId: string;
  category: string;
}

interface Period {
  id?: string;
  duration: number;
  players: {
    position: string;
    playerId: string;
    isSubstitute?: boolean;
  }[];
}

export const TeamSelectionManager = ({ fixtureId, category }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<Period[]>([
    { duration: 10, players: [] },
  ]);

  // Fetch positions from the database
  const { data: positions } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("abbreviation")
        .order("abbreviation");

      if (error) throw error;
      return data.map(pos => pos.abbreviation);
    },
  });

  // Fetch available players for the category
  const { data: players } = useQuery({
    queryKey: ["players", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", category)
        .order("squad_number");

      if (error) throw error;
      return data;
    },
  });

  // Fetch existing team selection if any
  const { data: existingSelection } = useQuery({
    queryKey: ["team-selection", fixtureId],
    queryFn: async () => {
      const { data: periodsData, error: periodsError } = await supabase
        .from("fixture_playing_periods")
        .select(`
          id,
          duration_minutes,
          fixture_player_positions (
            id,
            player_id,
            position,
            is_substitute
          )
        `)
        .eq("fixture_id", fixtureId)
        .order("start_minute");

      if (periodsError) throw periodsError;
      return periodsData;
    },
  });

  useEffect(() => {
    if (existingSelection) {
      const mappedPeriods = existingSelection.map((period) => ({
        id: period.id,
        duration: period.duration_minutes,
        players: period.fixture_player_positions.map((pos) => ({
          position: pos.position,
          playerId: pos.player_id,
          isSubstitute: pos.is_substitute,
        })),
      }));
      setPeriods(mappedPeriods);
    }
  }, [existingSelection]);

  const handlePlayerChange = (periodIndex: number, position: string, playerId: string, isSubstitute = false) => {
    setPeriods((currentPeriods) => {
      const newPeriods = [...currentPeriods];
      const periodPlayers = [...newPeriods[periodIndex].players];
      
      const existingPlayerIndex = periodPlayers.findIndex(
        (p) => p.position === position && p.isSubstitute === isSubstitute
      );

      if (existingPlayerIndex >= 0) {
        periodPlayers[existingPlayerIndex] = { position, playerId, isSubstitute };
      } else {
        periodPlayers.push({ position, playerId, isSubstitute });
      }

      newPeriods[periodIndex] = {
        ...newPeriods[periodIndex],
        players: periodPlayers,
      };

      return newPeriods;
    });
  };

  const handleDurationChange = (periodIndex: number, duration: number) => {
    setPeriods((currentPeriods) => {
      const newPeriods = [...currentPeriods];
      newPeriods[periodIndex] = {
        ...newPeriods[periodIndex],
        duration,
      };
      return newPeriods;
    });
  };

  const addPeriod = () => {
    setPeriods((current) => [...current, { duration: 10, players: [] }]);
  };

  const removePeriod = (index: number) => {
    setPeriods((current) => current.filter((_, i) => i !== index));
  };

  const saveTeamSelection = async () => {
    try {
      // Delete existing periods and positions
      await supabase
        .from("fixture_playing_periods")
        .delete()
        .eq("fixture_id", fixtureId);

      let startMinute = 0;
      for (const period of periods) {
        // Create period
        const { data: periodData, error: periodError } = await supabase
          .from("fixture_playing_periods")
          .insert({
            fixture_id: fixtureId,
            start_minute: startMinute,
            duration_minutes: period.duration,
          })
          .select()
          .single();

        if (periodError) throw periodError;

        // Create player positions
        const positions = period.players.map((player) => ({
          fixture_id: fixtureId,
          period_id: periodData.id,
          player_id: player.playerId,
          position: player.position,
          is_substitute: player.isSubstitute,
        }));

        if (positions.length > 0) {
          const { error: positionsError } = await supabase
            .from("fixture_player_positions")
            .insert(positions);

          if (positionsError) throw positionsError;
        }

        startMinute += period.duration;
      }

      toast({
        title: "Success",
        description: "Team selection saved successfully",
      });
    } catch (error) {
      console.error("Error saving team selection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selection",
      });
    }
  };

  if (!positions) return <div>Loading positions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-4 mb-4">
        <Button onClick={addPeriod} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Period
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            {periods.map((_, index) => (
              <TableHead key={index} className="min-w-[200px]">
                <div className="flex items-center justify-between">
                  <span>Period {index + 1}</span>
                  {periods.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePeriod(index)}
                      className="ml-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position}>
              <TableCell>{position}</TableCell>
              {periods.map((period, periodIndex) => (
                <TableCell key={periodIndex}>
                  <Select
                    value={period.players.find(p => p.position === position)?.playerId || ""}
                    onValueChange={(value) => handlePlayerChange(periodIndex, position, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} (#{player.squad_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Duration (mins)</TableCell>
            {periods.map((period, index) => (
              <TableCell key={index}>
                <Input
                  type="number"
                  value={period.duration}
                  onChange={(e) => handleDurationChange(index, parseInt(e.target.value))}
                  className="w-20"
                />
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell>Substitutes</TableCell>
            {periods.map((period, periodIndex) => (
              <TableCell key={periodIndex}>
                <div className="space-y-2">
                  <Select
                    value={period.players.find(p => p.isSubstitute)?.playerId || ""}
                    onValueChange={(value) => handlePlayerChange(periodIndex, "SUB", value, true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select substitute" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} (#{player.squad_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={saveTeamSelection}>Save Team Selection</Button>
      </div>
    </div>
  );
};