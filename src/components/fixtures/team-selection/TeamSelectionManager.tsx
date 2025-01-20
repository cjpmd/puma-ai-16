import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormationView } from "../FormationView";
import { PrintTeamSelection } from "../PrintTeamSelection";
import { TeamSelectionHeader } from "./TeamSelectionHeader";
import { PeriodTable } from "./PeriodTable";

interface TeamSelectionManagerProps {
  fixtureId: string;
  category: string;
  format?: string;
}

export const TeamSelectionManager = ({ 
  fixtureId, 
  category, 
  format = "7-a-side" 
}: TeamSelectionManagerProps) => {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<any[]>([]);
  const [captain, setCaptain] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showFormation, setShowFormation] = useState(false);

  // Get the number of positions based on format
  const getPositionsCount = (format: string) => {
    switch (format) {
      case "4-a-side": return 4;
      case "5-a-side": return 5;
      case "7-a-side": return 7;
      case "9-a-side": return 9;
      case "11-a-side": return 11;
      default: return 7;
    }
  };

  // Initialize periods with correct number of positions
  useEffect(() => {
    const positionsCount = getPositionsCount(format);
    setPeriods([{
      id: crypto.randomUUID(),
      start_minute: 0,
      duration_minutes: 20,
      positions: Array.from({ length: positionsCount }, (_, i) => ({ 
        position: "", 
        playerId: "" 
      })),
      substitutes: Array.from({ length: Math.ceil(positionsCount / 2) }, (_, i) => ({ 
        playerId: "" 
      }))
    }]);
  }, [format]);

  // Query fixture details including format
  const { data: fixture } = useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("id", fixtureId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching fixture:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch fixture details",
        });
        throw error;
      }

      return data;
    },
  });

  // Query players for the given category
  const { data: playersData, error: playersError } = useQuery({
    queryKey: ["players", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", category.toUpperCase())
        .order("squad_number");

      if (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch players",
        });
        throw error;
      }

      return data || [];
    },
  });

  // Fetch existing team selection if any
  const { data: existingSelection } = useQuery({
    queryKey: ["team-selection", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;

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
    enabled: !!fixtureId,
  });

  useEffect(() => {
    if (existingSelection) {
      const mappedPeriods = existingSelection.periods.map((period) => {
        const starters = period.fixture_player_positions.filter(pos => !pos.is_substitute);
        const subs = period.fixture_player_positions.filter(pos => pos.is_substitute);
        
        return {
          id: period.id,
          duration_minutes: period.duration_minutes,
          positions: Array.from({ length: getPositionsCount(format) }, (_, i) => {
            const existingPosition = starters[i];
            return {
              index: i,
              position: existingPosition?.position || "",
              playerId: existingPosition?.player_id || "",
            };
          }),
          substitutes: Array.from({ length: Math.ceil(getPositionsCount(format) / 2) }, (_, i) => {
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
  }, [existingSelection, format]);

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
      newPeriods[periodIndex].duration_minutes = duration;
      return newPeriods;
    });
  };

  const addPeriod = () => {
    setPeriods((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        start_minute: 0,
        duration_minutes: 20,
        positions: Array.from({ length: getPositionsCount(format) }, (_, i) => ({ 
          position: "", 
          playerId: "" 
        })),
        substitutes: Array.from({ length: Math.ceil(getPositionsCount(format) / 2) }, (_, i) => ({ 
          playerId: "" 
        })),
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
            duration_minutes: period.duration_minutes,
          })
          .select()
          .single();

        if (periodError) throw periodError;
        
        createdPeriods.push({
          periodId: periodData.id,
          positions: period.positions,
          substitutes: period.substitutes
        });

        startMinute += period.duration_minutes;
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

  // Fetch fixture data
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
    <div className="space-y-4 max-h-[80vh] flex flex-col">
      <TeamSelectionHeader
        players={playersData}
        captain={captain}
        onCaptainChange={setCaptain}
        onShowFormationToggle={() => setShowFormation(!showFormation)}
        showFormation={showFormation}
        onAddPeriod={addPeriod}
        onPrint={handlePrint}
        onSave={saveTeamSelection}
        isSaving={isSaving}
      />

      <div className="flex-1 overflow-y-auto min-h-0 pb-4">
        {showFormation && (
          <div className="mb-4">
            {periods.map((period, index) => (
              <FormationView
                key={index}
                positions={period.positions}
                players={playersData || []}
                periodNumber={index + 1}
                duration={period.duration_minutes}
              />
            ))}
          </div>
        )}

        <div className="print:hidden">
          <div className="overflow-x-auto">
            <PeriodTable
              periods={periods}
              positions={positions}
              players={playersData}
              format={format}
              onPositionChange={handlePositionChange}
              onPlayerChange={handlePlayerChange}
              onSubstituteChange={handleSubstituteChange}
              onDurationChange={handleDurationChange}
              onRemovePeriod={removePeriod}
            />
          </div>
        </div>

        {playersData && fixture && (
          <PrintTeamSelection
            fixture={fixture}
            periods={periods}
            players={playersData}
          />
        )}
      </div>
    </div>
  );
};

export default TeamSelectionManager;
