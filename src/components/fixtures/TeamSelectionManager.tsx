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
import { Plus, Check, Printer, LayoutGrid, MinusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { PrintTeamSelection } from './PrintTeamSelection';
import { FormationView } from "./FormationView";

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
  const [isSaving, setIsSaving] = useState(false);
  const [players, setPlayers] = useState<any[]>(null);
  const [fixtures, setFixtures] = useState<any[]>(null);
  const [showFormation, setShowFormation] = useState(false);

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
  const { data: playersData, error: playersError } = useQuery({
    queryKey: ["players", category],
    queryFn: async () => {
      console.log("Fetching players for category:", category);
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", category.toUpperCase())
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
      // Only fetch if fixtureId is provided
      if (!fixtureId) {
        return null;
      }

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
    enabled: !!fixtureId, // Only run query if fixtureId exists
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
    setIsSaving(true);
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
        const { error: captainError } = await supabase
          .from("fixture_team_selections")
          .insert({
            fixture_id: fixtureId,
            player_id: captain,
            is_captain: true,
          });

        if (captainError) throw captainError;
      }

      let startMinute = 0;
      
      // Create all periods first and store their IDs
      const createdPeriods = [];
      for (const period of periods) {
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
        
        createdPeriods.push({
          periodId: periodData.id,
          positions: period.positions,
          substitutes: period.substitutes
        });

        startMinute += period.duration;
      }

      // Now create player positions using the stored period IDs
      for (const period of createdPeriods) {
        const starterPositions = period.positions
          .filter(pos => pos.position && pos.playerId)
          .map((pos) => ({
            fixture_id: fixtureId,
            period_id: period.periodId,
            player_id: pos.playerId,
            position: pos.position,
            is_substitute: false,
          }));

        const substitutePositions = period.substitutes
          .filter(sub => sub.playerId)
          .map((sub) => ({
            fixture_id: fixtureId,
            period_id: period.periodId,
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
      }

      toast({
        title: "Success",
        description: "Team selection saved successfully",
      });
      
      // Reset the saving state after a delay
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving team selection:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save team selection",
      });
      setIsSaving(false);
    }
  };

  // Add fixture data query
  const { data: fixture } = useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("id", fixtureId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!fixtureId,
  });

  if (playersError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading players: {playersError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!positions || !playersData) return <div>Loading...</div>;

  if (playersData.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No players found for category: {category}. Please add players to this category first.
        </AlertDescription>
      </Alert>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background pt-4 pb-2 border-b">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 mr-auto">
            <span className="font-medium">Captain:</span>
            <Select value={captain} onValueChange={setCaptain}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Select captain" />
              </SelectTrigger>
              <SelectContent>
                {playersData?.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} (#{player.squad_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => setShowFormation(!showFormation)} 
            variant="outline"
            className="print:hidden"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            {showFormation ? "Hide" : "Show"} Formation
          </Button>
          <Button onClick={addPeriod} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
          <Button 
            onClick={handlePrint}
            variant="outline"
            className="print:hidden"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Team Selection
          </Button>
          <Button 
            onClick={saveTeamSelection} 
            disabled={isSaving}
            className="print:hidden"
          >
            {isSaving ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {showFormation && (
        <div className="mb-4">
          {periods.map((period, index) => (
            <FormationView
              key={index}
              positions={period.positions}
              players={playersData || []}
              periodNumber={index + 1}
              duration={period.duration}
            />
          ))}
        </div>
      )}

      <div className="print:hidden">
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
                          <MinusCircle className="w-4 h-4" />
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
                            {playersData?.map((player) => (
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
                          {playersData?.map((player) => (
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

        {/* Switched positions of Save and Add Period buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <Button 
            onClick={saveTeamSelection} 
            disabled={isSaving}
            className="print:hidden"
          >
            {isSaving ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              "Save"
            )}
          </Button>
          <Button onClick={addPeriod} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Period
          </Button>
        </div>
      </div>

      {playersData && fixture && (
        <PrintTeamSelection
          fixture={fixture}
          periods={periods.map(period => ({
            duration: period.duration,
            positions: period.positions.map(pos => ({
              position: pos.position,
              playerId: pos.playerId
            })),
            substitutes: period.substitutes.map(sub => ({
              playerId: sub.playerId
            }))
          }))}
          players={playersData}
          captain={captain}
        />
      )}
    </div>
  );
};

export default TeamSelectionManager;