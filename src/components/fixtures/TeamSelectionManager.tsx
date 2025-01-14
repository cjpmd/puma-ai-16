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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamSelectionManagerProps {
  fixtureId: string;
  category: string;
}

interface Period {
  id?: string;
  duration: number;
  positions: {
    index: number;
    position: string;
    playerId: string;
  }[];
  substitutes: {
    index: number;
    playerId: string;
  }[];
}

export const TeamSelectionManager = ({ fixtureId, category }: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<Period[]>([
    { 
      duration: 10, 
      positions: Array.from({ length: 7 }, (_, i) => ({ index: i, position: "", playerId: "" })),
      substitutes: Array.from({ length: 3 }, (_, i) => ({ index: i, playerId: "" }))
    },
  ]);
  const [captain, setCaptain] = useState<string>("");

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
  const { data: players, error: playersError } = useQuery({
    queryKey: ["players", category],
    queryFn: async () => {
      console.log("Fetching players for category:", category);
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", category.toUpperCase()) // Ensure category matches exactly
        .order("squad_number");

      if (error) {
        console.error("Error fetching players:", error);
        throw error;
      }
      console.log("Players data:", data);
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

      // Fetch captain information
      const { data: captainData } = await supabase
        .from("fixture_team_selections")
        .select("player_id")
        .eq("fixture_id", fixtureId)
        .eq("is_captain", true)
        .maybeSingle();

      return {
        periods: periodsData,
        captain: captainData?.player_id
      };
    },
  });

  useEffect(() => {
    if (existingSelection) {
      const mappedPeriods = existingSelection.periods.map((period) => {
        const starters = period.fixture_player_positions.filter(pos => !pos.is_substitute);
        const subs = period.fixture_player_positions.filter(pos => pos.is_substitute);
        
        return {
          id: period.id,
          duration: period.duration_minutes,
          positions: Array.from({ length: 7 }, (_, i) => {
            const existingPosition = starters[i];
            return {
              index: i,
              position: existingPosition?.position || "",
              playerId: existingPosition?.player_id || "",
            };
          }),
          substitutes: Array.from({ length: 3 }, (_, i) => {
            const existingSub = subs[i];
            return {
              index: i,
              playerId: existingSub?.player_id || "",
            };
          }),
        };
      });
      setPeriods(mappedPeriods);
      if (existingSelection.captain) {
        setCaptain(existingSelection.captain);
      }
    }
  }, [existingSelection]);

  const handlePositionChange = (periodIndex: number, positionIndex: number, position: string) => {
    setPeriods((currentPeriods) => {
      const newPeriods = [...currentPeriods];
      newPeriods[periodIndex].positions[positionIndex].position = position;
      return newPeriods;
    });
  };

  const handlePlayerChange = (periodIndex: number, positionIndex: number, playerId: string) => {
    setPeriods((currentPeriods) => {
      const newPeriods = [...currentPeriods];
      newPeriods[periodIndex].positions[positionIndex].playerId = playerId;
      return newPeriods;
    });
  };

  const handleSubstituteChange = (periodIndex: number, subIndex: number, playerId: string) => {
    setPeriods((currentPeriods) => {
      const newPeriods = [...currentPeriods];
      newPeriods[periodIndex].substitutes[subIndex].playerId = playerId;
      return newPeriods;
    });
  };

  const handleDurationChange = (periodIndex: number, duration: number) => {
    setPeriods((currentPeriods) => {
      const newPeriods = [...currentPeriods];
      newPeriods[periodIndex].duration = duration;
      return newPeriods;
    });
  };

  const addPeriod = () => {
    setPeriods((current) => [
      ...current,
      {
        duration: 10,
        positions: Array.from({ length: 7 }, (_, i) => ({ index: i, position: "", playerId: "" })),
        substitutes: Array.from({ length: 3 }, (_, i) => ({ index: i, playerId: "" })),
      },
    ]);
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

      // Delete existing team selections
      await supabase
        .from("fixture_team_selections")
        .delete()
        .eq("fixture_id", fixtureId);

      // Save captain
      if (captain) {
        await supabase
          .from("fixture_team_selections")
          .insert({
            fixture_id: fixtureId,
            player_id: captain,
            is_captain: true,
          });
      }

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

        // Create player positions for starters
        const starterPositions = period.positions
          .filter(pos => pos.position && pos.playerId)
          .map((pos) => ({
            fixture_id: fixtureId,
            period_id: periodData.id,
            player_id: pos.playerId,
            position: pos.position,
            is_substitute: false,
          }));

        // Create player positions for substitutes
        const substitutePositions = period.substitutes
          .filter(sub => sub.playerId)
          .map((sub) => ({
            fixture_id: fixtureId,
            period_id: periodData.id,
            player_id: sub.playerId,
            position: "SUB",
            is_substitute: true,
          }));

        const allPositions = [...starterPositions, ...substitutePositions];

        if (allPositions.length > 0) {
          const { error: positionsError } = await supabase
            .from("fixture_player_positions")
            .insert(allPositions);

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

  if (playersError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading players: {playersError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!positions || !players) return <div>Loading...</div>;

  if (players.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No players found for category: {category}. Please add players to this category first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-4 mb-4">
        <span className="font-medium">Captain:</span>
        <Select value={captain} onValueChange={setCaptain}>
          <SelectTrigger className="w-[200px] h-8">
            <SelectValue placeholder="Select captain" />
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

      <div className="flex justify-end">
        <Button onClick={addPeriod} size="sm" className="flex items-center">
          <Plus className="w-4 h-4 mr-1" />
          Add Period
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Position</TableHead>
              {periods.map((_, index) => (
                <TableHead key={index} className="min-w-[160px]">
                  <div className="flex items-center justify-between">
                    <span>Period {index + 1}</span>
                    {periods.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePeriod(index)}
                        className="h-6 w-6 p-0"
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
            {/* Starting players */}
            {Array.from({ length: 7 }, (_, positionIndex) => (
              <TableRow key={positionIndex}>
                <TableCell className="font-medium">{positionIndex + 1}</TableCell>
                {periods.map((period, periodIndex) => (
                  <TableCell key={periodIndex} className="p-1">
                    <div className="space-y-1">
                      <Select
                        value={period.positions[positionIndex].position}
                        onValueChange={(value) => handlePositionChange(periodIndex, positionIndex, value)}
                      >
                        <SelectTrigger className="h-7">
                          <SelectValue placeholder="Position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions?.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={period.positions[positionIndex].playerId}
                        onValueChange={(value) => handlePlayerChange(periodIndex, positionIndex, value)}
                      >
                        <SelectTrigger className="h-7">
                          <SelectValue placeholder="Player" />
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
            ))}
            
            {/* Substitutes section */}
            <TableRow>
              <TableCell colSpan={periods.length + 1} className="bg-muted/50 font-medium">
                Substitutes
              </TableCell>
            </TableRow>
            {Array.from({ length: 3 }, (_, subIndex) => (
              <TableRow key={`sub-${subIndex}`}>
                <TableCell className="font-medium">SUB {subIndex + 1}</TableCell>
                {periods.map((period, periodIndex) => (
                  <TableCell key={periodIndex} className="p-1">
                    <Select
                      value={period.substitutes[subIndex].playerId}
                      onValueChange={(value) => handleSubstituteChange(periodIndex, subIndex, value)}
                    >
                      <SelectTrigger className="h-7">
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
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Duration row */}
            <TableRow>
              <TableCell>Duration</TableCell>
              {periods.map((period, index) => (
                <TableCell key={index} className="p-1">
                  <Input
                    type="number"
                    value={period.duration}
                    onChange={(e) => handleDurationChange(index, parseInt(e.target.value))}
                    className="h-7 w-16"
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={saveTeamSelection}>Save Team Selection</Button>
      </div>
    </div>
  );
};