
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTeamSelections = (fixture: any | null) => {
  const { toast } = useToast();
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periodsPerTeam, setPeriodsPerTeam] = useState<Record<string, Array<{ id: string; duration: number }>>>({});
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>>({});
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSelections = async () => {
      if (!fixture) return;

      const { data: eventPeriods, error: periodsError } = await supabase
        .from('event_periods')
        .select('*')
        .eq('event_id', fixture.id)
        .eq('event_type', 'FIXTURE')
        .order('period_number');

      if (periodsError) {
        console.error("Error fetching periods:", periodsError);
        return;
      }

      const { data: selectionsData, error: selectionsError } = await supabase
        .from('team_selections')
        .select('*')
        .eq('event_id', fixture.id)
        .eq('event_type', 'FIXTURE');

      if (selectionsError) {
        console.error("Error fetching selections:", selectionsError);
        return;
      }

      const { data: teamSelections, error: teamSelectionsError } = await supabase
        .from('fixture_team_selections')
        .select('*')
        .eq('fixture_id', fixture.id)
        .eq('is_captain', true);

      if (teamSelectionsError) {
        console.error("Error fetching team captains:", teamSelectionsError);
        return;
      }

      const captains: Record<string, string> = {};
      teamSelections?.forEach(selection => {
        if (selection.is_captain) {
          captains[selection.team_number.toString()] = selection.player_id;
        }
      });
      setTeamCaptains(captains);

      const newPeriodsPerTeam: Record<string, Array<{ id: string; duration: number }>> = {};
      const transformedSelections: Record<string, Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>> = {};
      const newPerformanceCategories: Record<string, string> = {};

      for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
        const teamKey = i.toString();
        newPeriodsPerTeam[teamKey] = [];
      }

      eventPeriods.forEach(period => {
        for (let i = 1; i <= (fixture.number_of_teams || 1); i++) {
          const teamKey = i.toString();
          const periodKey = `period-${period.period_number}`;
          newPeriodsPerTeam[teamKey].push({
            id: periodKey,
            duration: period.duration_minutes
          });
        }
      });

      if (Object.values(newPeriodsPerTeam).every(periods => periods.length === 0)) {
        Object.keys(newPeriodsPerTeam).forEach(teamKey => {
          newPeriodsPerTeam[teamKey] = [{ id: "period-1", duration: 20 }];
        });
      }

      selectionsData.forEach(selection => {
        const periodKey = `period-${selection.period_number}`;
        const teamKey = selection.team_number.toString();

        if (!transformedSelections[periodKey]) {
          transformedSelections[periodKey] = {};
        }
        if (!transformedSelections[periodKey][teamKey]) {
          transformedSelections[periodKey][teamKey] = {};
        }

        transformedSelections[periodKey][teamKey][selection.position] = {
          playerId: selection.player_id,
          position: selection.position,
          performanceCategory: selection.performance_category
        };

        newPerformanceCategories[`${periodKey}-${teamKey}`] = selection.performance_category || 'MESSI';
      });

      setPeriodsPerTeam(newPeriodsPerTeam);
      setSelections(transformedSelections);
      setPerformanceCategories(newPerformanceCategories);

      const newSelectedPlayers = new Set<string>();
      selectionsData.forEach(selection => {
        if (selection.player_id !== "unassigned") {
          newSelectedPlayers.add(selection.playerId);
        }
      });
      setSelectedPlayers(newSelectedPlayers);
    };

    fetchSelections();
  }, [fixture]);

  return {
    selectedPlayers,
    setSelectedPlayers,
    periodsPerTeam,
    setPeriodsPerTeam,
    selections,
    setSelections,
    performanceCategories,
    setPerformanceCategories,
    teamCaptains,
    setTeamCaptains,
    isSaving,
    setIsSaving
  };
};
