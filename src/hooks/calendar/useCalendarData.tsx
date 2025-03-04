
import { format } from "date-fns";
import { useCalendarSubscriptions } from "./useCalendarSubscriptions";
import { useTrainingSessions } from "./useTrainingSessions";
import { useFixtures } from "./useFixtures";
import { useFestivals } from "./useFestivals";
import { useTournaments } from "./useTournaments";
import { useObjectives } from "./useObjectives";

export const useCalendarData = (date: Date) => {
  // Format date for logging
  const formattedDate = format(date, "yyyy-MM-dd");
  console.log("Starting to fetch calendar data for date:", formattedDate);

  // Set up Supabase realtime subscriptions
  useCalendarSubscriptions(date);

  // Fetch various data types
  const { 
    data: sessions = [], 
    refetch: refetchSessions,
    isLoading: isLoadingSessions 
  } = useTrainingSessions(date);

  const { 
    data: fixtures = [], 
    refetch: refetchFixtures,
    isLoading: isLoadingFixtures 
  } = useFixtures(date);

  const { 
    data: festivals = [], 
    refetch: refetchFestivals,
    isLoading: isLoadingFestivals 
  } = useFestivals(date);

  const { 
    data: tournaments = [], 
    refetch: refetchTournaments,
    isLoading: isLoadingTournaments 
  } = useTournaments(date);

  const { 
    data: objectives = [], 
    refetch: refetchObjectives,
    isLoading: isLoadingObjectives 
  } = useObjectives(date);

  // Combine loading states
  const isLoading = isLoadingSessions || isLoadingFixtures || isLoadingFestivals || isLoadingTournaments || isLoadingObjectives;

  // Return combined data and refetch functions
  return {
    sessions,
    fixtures,
    festivals,
    tournaments,
    objectives,
    refetchSessions,
    refetchFixtures,
    refetchFestivals,
    refetchTournaments,
    refetchObjectives,
    isLoading
  };
};
