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

interface Position {
  abbreviation: string;
  full_name: string;
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
  const [positions, setPositions] = useState<Position[]>([]);

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

  // Query fixture details including format
  const { data: fixtureData } = useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: async () => {
      if (!fixtureId) return null;
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("id", fixtureId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!fixtureId,
  });

  // Get team settings to use as fallback category
  const { data: teamSettings } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_settings")
        .select("team_name")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Query players for the given category or team category
  const { data: playersData, error: playersError } = useQuery({
    queryKey: ["players", category, teamSettings?.team_name],
    queryFn: async () => {
      // First try to get players by the provided category
      let { data: categoryPlayers, error: categoryError } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", category.toUpperCase())
        .order("squad_number");

      // If no players found and we have team settings, try team_category
      if ((!categoryPlayers || categoryPlayers.length === 0) && teamSettings?.team_name) {
        const { data: teamPlayers, error: teamError } = await supabase
          .from("players")
          .select("id, name, squad_number")
          .eq("team_category", teamSettings.team_name)
          .order("squad_number");

        if (teamError) throw teamError;
        return teamPlayers || [];
      }

      if (categoryError) throw categoryError;
      return categoryPlayers || [];
    },
    enabled: !!category || !!teamSettings?.team_name,
  });

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

  if (playersError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading players: {playersError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!playersData) return <div>Loading...</div>;

  if (playersData.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No players found. Players will be loaded from the team category if available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 max-h-[80vh] flex flex-col">
      <TeamSelectionHeader
        players={playersData}
        captain={captain}
        onCaptainChange={setCaptain}
        onShowFormationToggle={() => setShowFormation(!showFormation)}
        showFormation={showFormation}
        onAddPeriod={addPeriod}
        onPrint={() => window.print()}
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

        {playersData && fixtureData && (
          <PrintTeamSelection
            fixture={fixtureData}
            periods={periods}
            players={playersData}
          />
        )}
      </div>
    </div>
  );
};

export default TeamSelectionManager;
