import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PrintTeamSelection } from "./fixtures/PrintTeamSelection";
import { PeriodTable } from "./fixtures/team-selection/PeriodTable";

interface Player {
  id: string;
  name: string;
  squad_number: number;
}

interface FormationSelectorProps {
  players: Player[];
  fixtureId: string;
  format: string;
}

export const FormationSelector = ({ players, fixtureId, format }: FormationSelectorProps) => {
  const [periods, setPeriods] = useState<any[]>([]);
  const { toast } = useToast();

  const getPositionsForFormat = (format: string) => {
    const formatPositions: { [key: string]: string[] } = {
      "4-a-side": ["GK", "D", "M", "ST"],
      "5-a-side": ["GK", "DL", "DR", "M", "ST"],
      "7-a-side": ["GK", "DL", "DCR", "DR", "ML", "MR", "ST"],
      "9-a-side": ["GK", "DL", "DC", "DR", "ML", "MC", "MR", "AMC", "ST"],
      "11-a-side": ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "AML", "ST", "AMR"]
    };

    return formatPositions[format] || formatPositions["7-a-side"];
  };

  useEffect(() => {
    const fetchPeriods = async () => {
      const { data: existingPeriods, error } = await supabase
        .from("fixture_playing_periods")
        .select("*")
        .eq("fixture_id", fixtureId)
        .order("start_minute", { ascending: true });

      if (error) {
        console.error("Error fetching periods:", error);
        return;
      }

      if (existingPeriods.length === 0) {
        // Create default periods if none exist
        const defaultPeriods = [
          { start_minute: 0, duration_minutes: 20 },
          { start_minute: 20, duration_minutes: 20 }
        ];

        for (const period of defaultPeriods) {
          const { error: insertError } = await supabase
            .from("fixture_playing_periods")
            .insert({
              fixture_id: fixtureId,
              start_minute: period.start_minute,
              duration_minutes: period.duration_minutes
            });

          if (insertError) {
            console.error("Error creating period:", insertError);
          }
        }

        // Fetch the newly created periods
        const { data: newPeriods } = await supabase
          .from("fixture_playing_periods")
          .select("*")
          .eq("fixture_id", fixtureId)
          .order("start_minute", { ascending: true });

        setPeriods(newPeriods || []);
      } else {
        setPeriods(existingPeriods);
      }
    };

    fetchPeriods();
  }, [fixtureId]);

  const positions = getPositionsForFormat(format);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PrintTeamSelection
          fixtureId={fixtureId}
          periods={periods}
          positions={positions}
        />
      </div>

      {periods.map((period) => (
        <PeriodTable
          key={period.id}
          period={period}
          positions={positions}
          players={players}
          fixtureId={fixtureId}
        />
      ))}
    </div>
  );
};