
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const useFixtures = (date: Date) => {
  const { toast } = useToast();
  const formattedDate = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["fixtures", formattedDate],
    queryFn: async () => {
      console.log("Fetching fixtures for date:", formattedDate);
      try {
        console.log("Executing fixtures query for date:", formattedDate);
        const { data: fixturesData, error: fixturesError } = await supabase
          .from("fixtures")
          .select(`
            *,
            fixture_team_times(*),
            fixture_team_scores(*)
          `)
          .eq("date", formattedDate);
        
        if (fixturesError) {
          console.error("Error in fixtures query:", fixturesError);
          throw fixturesError;
        }
        
        console.log("Raw fixtures data:", fixturesData?.length, "items");
        
        if (!fixturesData?.length) {
          console.log("No fixtures found for date:", formattedDate);
          return [];
        }

        // Create a Map to deduplicate fixtures by ID
        const fixturesById = new Map();
        
        fixturesData.forEach(fixture => {
          // Store fixtures by ID to automatically deduplicate
          fixturesById.set(fixture.id, {
            ...fixture,
            fixture_team_times: [],
            fixture_team_scores: []
          });
        });
        
        // Now go through and add the relation data for each unique fixture
        fixturesData.forEach(fixture => {
          const uniqueFixture = fixturesById.get(fixture.id);
          
          // Add team times if they exist and aren't duplicates
          if (fixture.fixture_team_times && fixture.fixture_team_times.length > 0) {
            fixture.fixture_team_times.forEach(teamTime => {
              if (!uniqueFixture.fixture_team_times.some(tt => tt.id === teamTime.id)) {
                uniqueFixture.fixture_team_times.push(teamTime);
              }
            });
          }
          
          // Add team scores if they exist and aren't duplicates
          if (fixture.fixture_team_scores && fixture.fixture_team_scores.length > 0) {
            fixture.fixture_team_scores.forEach(teamScore => {
              if (!uniqueFixture.fixture_team_scores.some(ts => ts.id === teamScore.id)) {
                uniqueFixture.fixture_team_scores.push(teamScore);
              }
            });
          }
        });
        
        // Convert the Map values to an array
        const uniqueFixtures = Array.from(fixturesById.values());
        console.log("Unique fixtures after deduplication:", uniqueFixtures.length, "items");

        // Get fixture IDs for attendance query
        const fixtureIds = uniqueFixtures.map(f => f.id);
        console.log("Fetching attendance for fixture IDs:", fixtureIds);

        // Fetch attendance data for these fixtures
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendance")
          .select("status, player_id, responded_by, event_id")
          .eq("event_type", "FIXTURE")
          .in("event_id", fixtureIds);

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
          throw attendanceError;
        }
        
        // Add attendance data to each fixture
        const result = uniqueFixtures.map(fixture => ({
          ...fixture,
          event_attendance: (attendanceData || []).filter(a => a.event_id === fixture.id)
        }));

        console.log("Final fixtures data:", result.length, "items");
        return result;
      } catch (error) {
        console.error("Error fetching fixtures:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load fixtures. Please try again.",
        });
        return [];
      }
    },
    staleTime: 0, // Always refetch when requested
    gcTime: 60000, // 1 minute garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid duplicates
    refetchOnMount: true,
    refetchOnReconnect: true
  });
};
