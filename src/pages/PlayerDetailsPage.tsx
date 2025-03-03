
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerDetails } from "@/components/PlayerDetails";
import { useQuery } from "@tanstack/react-query";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { Player, PlayerType } from "@/types/player";
import { differenceInYears } from "date-fns";

interface Parent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0); // Add version to force data refresh

  // Query for player details, attributes, and attribute history
  const { data: playerData, refetch: refetchPlayerData } = useQuery({
    queryKey: ["player-with-attributes", id, dataVersion],
    queryFn: async () => {
      console.log("Fetching player data for ID:", id);
      
      try {
        // Try to ensure the profile_image column exists first
        await supabase.rpc('execute_sql', { 
          sql_string: "ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_image text"
        });
      } catch (error) {
        console.log("Column creation via RPC failed, continuing:", error);
      }
      
      // Fetch player details
      const { data: playerResult, error: playerError } = await supabase
        .from("players")
        .select(`
          *,
          attributes:player_attributes(*)
        `)
        .eq("id", id)
        .single();

      if (playerError) throw playerError;

      console.log("Player data fetched:", playerResult);
      console.log("Profile image URL:", playerResult.profile_image);

      // Fetch attribute history
      const { data: historyData, error: historyError } = await supabase
        .from("player_attributes")
        .select("*")
        .eq("player_id", id)
        .order("created_at", { ascending: true });

      if (historyError) throw historyError;

      // Transform history data into the required format
      const attributeHistory: Record<string, { date: string; value: number }[]> = {};
      historyData?.forEach((attr) => {
        if (!attributeHistory[attr.name]) {
          attributeHistory[attr.name] = [];
        }
        attributeHistory[attr.name].push({
          date: attr.created_at,
          value: attr.value,
        });
      });

      // Calculate age based on date of birth if needed
      const calculatedAge = playerResult.date_of_birth 
        ? differenceInYears(new Date(), new Date(playerResult.date_of_birth)) 
        : playerResult.age;

      // Transform the player data to match the Player type
      const transformedPlayer: Player = {
        id: playerResult.id,
        name: playerResult.name,
        age: calculatedAge,
        dateOfBirth: playerResult.date_of_birth,
        squadNumber: playerResult.squad_number,
        playerType: playerResult.player_type as PlayerType,
        profileImage: playerResult.profile_image,
        teamCategory: playerResult.team_category,
        attributes: playerResult.attributes.map((attr: any) => ({
          id: attr.id,
          name: attr.name,
          value: attr.value,
          category: attr.category,
        })),
        attributeHistory,
        created_at: playerResult.created_at,
        updated_at: playerResult.updated_at,
      };

      return transformedPlayer;
    },
    enabled: !!id,
  });

  // Fetch parents data
  useEffect(() => {
    if (id) {
      const fetchParents = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from("player_parents")
            .select("*")
            .eq("player_id", id);

          if (error) {
            console.error("Error fetching parents:", error);
          } else {
            setParents(data || []);
          }
        } catch (error) {
          console.error("Failed to fetch parents:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchParents();
    }
  }, [id, dataVersion]); // Add dataVersion to dependencies

  useEffect(() => {
    if (playerData) {
      console.log("Updating player state with new data, image:", playerData.profileImage);
      setPlayer(playerData);
    }
  }, [playerData]);

  const handleParentSave = async () => {
    // Refresh parents after saving
    if (id) {
      try {
        const { data } = await supabase
          .from("player_parents")
          .select("*")
          .eq("player_id", id);
        
        setParents(data || []);
        // Force data refresh
        setDataVersion(v => v + 1);
      } catch (error) {
        console.error("Error refreshing parents after save:", error);
      }
    }
  };

  const handlePlayerUpdated = () => {
    if (id) {
      console.log("Player updated, refetching data...");
      refetchPlayerData();
      setDataVersion(v => v + 1); // Increment to force data refresh
    }
  };

  if (!player || !id) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{player.name}</h1>
        <ParentDetailsDialog 
          playerId={id} 
          existingParents={parents}
          onSave={handleParentSave} 
        />
      </div>
      <PlayerDetails player={player} onPlayerUpdated={handlePlayerUpdated} />
    </div>
  );
};

export default PlayerDetailsPage;
