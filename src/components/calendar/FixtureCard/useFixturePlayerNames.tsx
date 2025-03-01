
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Fixture } from "@/types/fixture";

export const useFixturePlayerNames = (fixture: Fixture) => {
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  // Fetch player names for MOTM
  useEffect(() => {
    const fetchPlayerNames = async () => {
      // Collect all player IDs to fetch
      const playerIds: string[] = [];
      
      // Add the main fixture MOTM if it exists
      if (fixture.motm_player_id) {
        playerIds.push(fixture.motm_player_id);
      }
      
      // Add team-specific MOTM player IDs if they exist
      if (fixture.fixture_team_scores && fixture.fixture_team_scores.length > 0) {
        fixture.fixture_team_scores.forEach(score => {
          if (score.motm_player_id) {
            playerIds.push(score.motm_player_id);
          }
        });
      }
      
      // Only fetch if we have player IDs
      if (playerIds.length > 0) {
        const { data, error } = await supabase
          .from('players')
          .select('id, name')
          .in('id', playerIds);
          
        if (error) {
          console.error("Error fetching player names:", error);
          return;
        }
        
        // Create a map of player IDs to names
        const playerMap: Record<string, string> = {};
        data?.forEach(player => {
          playerMap[player.id] = player.name;
        });
        
        setPlayerNames(playerMap);
      }
    };
    
    fetchPlayerNames();
  }, [fixture.motm_player_id, fixture.fixture_team_scores]);

  return playerNames;
};
