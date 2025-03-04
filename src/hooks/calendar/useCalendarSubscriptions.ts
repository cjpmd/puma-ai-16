
import { useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useCalendarSubscriptions = (date: Date) => {
  const queryClient = useQueryClient();
  const formattedDate = format(date, "yyyy-MM-dd");

  useEffect(() => {
    // Set up Supabase realtime subscriptions
    const fixturesSubscription = supabase
      .channel('fixtures-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'fixtures',
        filter: `date=eq.${formattedDate}`
      }, (payload) => {
        console.log('Fixtures changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["fixtures", formattedDate] });
      })
      .subscribe();

    const fixtureTeamScoresSubscription = supabase
      .channel('fixture-team-scores-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'fixture_team_scores'
      }, (payload) => {
        console.log('Fixture team scores changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["fixtures", formattedDate] });
      })
      .subscribe();

    const fixtureTeamTimesSubscription = supabase
      .channel('fixture-team-times-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'fixture_team_times'
      }, (payload) => {
        console.log('Fixture team times changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["fixtures", formattedDate] });
      })
      .subscribe();

    const festivalsSubscription = supabase
      .channel('festivals-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'festivals',
        filter: `date=eq.${formattedDate}`
      }, (payload) => {
        console.log('Festivals changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["festivals", formattedDate] });
      })
      .subscribe();

    const tournamentsSubscription = supabase
      .channel('tournaments-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tournaments',
        filter: `date=eq.${formattedDate}`
      }, (payload) => {
        console.log('Tournaments changed:', payload);
        queryClient.invalidateQueries({ queryKey: ["tournaments", formattedDate] });
      })
      .subscribe();

    // Cleanup subscriptions on unmount or date change
    return () => {
      fixturesSubscription.unsubscribe();
      fixtureTeamScoresSubscription.unsubscribe();
      fixtureTeamTimesSubscription.unsubscribe();
      festivalsSubscription.unsubscribe();
      tournamentsSubscription.unsubscribe();
    };
  }, [formattedDate, queryClient]);
};
