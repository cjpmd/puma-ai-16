
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlayerDetails } from "@/components/PlayerDetails";
import { useQuery } from "@tanstack/react-query";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { Player, PlayerType } from "@/types/player";
import { differenceInYears } from "date-fns";
import { toast } from "sonner";
import { columnExists } from "@/utils/database";

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
  const [profileImageAvailable, setProfileImageAvailable] = useState<boolean | null>(null);

  // Check for profile_image column and add it if missing
  useEffect(() => {
    const checkAndAddProfileImageColumn = async () => {
      if (!id) return;
      
      try {
        const exists = await columnExists('players', 'profile_image');
        console.log(`Profile image column available: ${exists}`);
        setProfileImageAvailable(exists);
        
        // Note: We're no longer trying to add the column since it requires SQL execution privileges
        // We'll just adapt the UI to work with or without the column
      } catch (error) {
        console.error('Error checking profile image column:', error);
        setProfileImageAvailable(false);
      }
    };
    
    checkAndAddProfileImageColumn();
  }, [id]);

  // Query for player details, attributes, and attribute history
  const { data: playerData, refetch: refetchPlayerData, isLoading: playerLoading, error: playerError } = useQuery({
    queryKey: ["player-with-attributes", id, dataVersion],
    queryFn: async () => {
      console.log("Fetching player data for ID:", id);
      
      if (!id) {
        throw new Error("No player ID provided");
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

      if (playerError) {
        console.error("Error fetching player:", playerError);
        throw playerError;
      }

      console.log("Player data fetched:", playerResult);
      
      // Log profile image URL if available
      if (profileImageAvailable && playerResult.profile_image) {
        console.log("Profile image URL:", playerResult.profile_image);
      } else {
        console.log("No profile image available");
      }

      // Fetch attribute history
      const { data: historyData, error: historyError } = await supabase
        .from("player_attributes")
        .select("*")
        .eq("player_id", id)
        .order("created_at", { ascending: true });

      // Handle potential error silently
      if (historyError) {
        console.warn("Error fetching player attribute history:", historyError);
        // Continue without history data rather than throwing error
      }

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
        name: playerResult.name || "Unknown Player",
        age: calculatedAge || 0,
        dateOfBirth: playerResult.date_of_birth,
        squadNumber: playerResult.squad_number || 0,
        playerType: playerResult.player_type as PlayerType || "OUTFIELD",
        profileImage: profileImageAvailable ? playerResult.profile_image : undefined,
        teamCategory: playerResult.team_category || "",
        attributes: playerResult.attributes ? playerResult.attributes.map((attr: any) => ({
          id: attr.id,
          name: attr.name,
          value: attr.value,
          category: attr.category,
          player_id: attr.player_id,
          created_at: attr.created_at,
        })) : [],
        attributeHistory,
        created_at: playerResult.created_at,
        updated_at: playerResult.updated_at,
        status: playerResult.status || "active",
      };

      return transformedPlayer;
    },
    enabled: !!id && profileImageAvailable !== null,
    retry: 1,
  });

  // Show toast if there's an error fetching player data
  useEffect(() => {
    if (playerError) {
      console.error("Error fetching player data:", playerError);
      toast.error("Failed to load player data", {
        description: "There was a problem retrieving the player information.",
      });
    }
  }, [playerError]);

  // Fetch parents data
  useEffect(() => {
    if (id) {
      const fetchParents = async () => {
        setIsLoading(true);
        try {
          // Don't try to create the table, just check if it exists
          const { data, error } = await supabase
            .from("player_parents")
            .select("*")
            .eq("player_id", id);

          if (error) {
            // If table doesn't exist, handle it silently
            if (error.code === '42P01') { // Relation doesn't exist
              console.warn("player_parents table doesn't exist");
              setParents([]);
            } else {
              console.error("Error fetching parents:", error);
              setParents([]);
            }
          } else {
            setParents(data || []);
          }
        } catch (error) {
          console.error("Failed to fetch parents:", error);
          setParents([]);
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
        const { data, error } = await supabase
          .from("player_parents")
          .select("*")
          .eq("player_id", id);
        
        if (!error) {
          setParents(data || []);
          // Force data refresh
          setDataVersion(v => v + 1);
        }
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
  
  // Show loading state
  if (playerLoading || isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading player details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (playerError) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 p-4 rounded-md">
          <h2 className="text-xl font-bold text-destructive">Error loading player data</h2>
          <p className="text-muted-foreground">
            There was a problem retrieving player information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

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
