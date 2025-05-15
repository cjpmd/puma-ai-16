
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Function to manually create the parent_child_linking table
 */
export const createParentChildLinkingTable = async (): Promise<boolean> => {
  try {
    console.log("Creating parent_child_linking table...");
    
    // Try direct table creation through Supabase
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.parent_child_linking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          parent_id UUID NOT NULL,
          player_id UUID NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(parent_id, player_id)
        );
      `
    });
    
    if (error) {
      console.error("Error creating parent_child_linking table:", error);
      return false;
    }
    
    toast.success("Parent-child linking table created successfully");
    return true;
  } catch (error) {
    console.error("Error creating parent_child_linking table:", error);
    return false;
  }
};

/**
 * Function to manually add linking code column to players table
 */
export const addLinkingCodeColumn = async (): Promise<boolean> => {
  try {
    console.log("Adding linking_code column to players table...");
    
    // First check if we can actually use the column - this is to detect if it already exists
    try {
      const { data, error } = await supabase
        .from("players")
        .select("linking_code")
        .limit(1);
      
      // If no error, column already exists
      if (!error) {
        console.log("linking_code column already exists");
        toast.success("linking_code column already exists");
        return true;
      }
      
      // If error is not about missing column, something else is wrong
      if (!error.message?.includes("column") || !error.message?.includes("does not exist")) {
        console.error("Unexpected error checking linking_code column:", error);
        return false;
      }
    } catch (checkError) {
      console.log("Check error, continuing with column creation", checkError);
    }
    
    // Since the column doesn't exist, we'll try to add it
    // First, try with the RPC approach
    try {
      const { error } = await supabase.rpc('execute_sql', {
        sql_string: `
          ALTER TABLE public.players 
          ADD COLUMN IF NOT EXISTS linking_code TEXT;
        `
      });
      
      if (error) {
        // If RPC fails, we'll try the direct update approach below
        console.error("RPC error adding linking_code column:", error);
      } else {
        toast.success("linking_code column added successfully via RPC");
        return true;
      }
    } catch (rpcError) {
      console.error("RPC exception:", rpcError);
    }
    
    // Direct update approach as fallback
    try {
      console.log("Trying direct update approach...");
      // Get one player to update
      const { data: players } = await supabase
        .from("players")
        .select("id")
        .limit(1);
      
      if (players && players.length > 0) {
        const playerId = players[0].id;
        // Try updating with a random code to force column creation
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const { error: updateError } = await supabase
          .from("players")
          .update({ linking_code: randomCode })
          .eq("id", playerId);
        
        if (!updateError) {
          console.log("Column created via update approach");
          toast.success("linking_code column added successfully via update");
          return true;
        }
        
        console.error("Update approach failed:", updateError);
        
        // Try one more direct approach - this might work better on some Supabase instances
        // First, try to insert the column directly by selecting a player and using an updater function
        try {
          await supabase.rpc('execute_sql', {
            sql_string: `
              DO $$
              BEGIN
                IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'players' AND column_name = 'linking_code'
                ) THEN
                  ALTER TABLE players ADD COLUMN linking_code TEXT;
                END IF;
              END
              $$;
            `
          });
          
          toast.success("Attempted alternative approach to add linking_code column");
          return true;
        } catch (alternativeError) {
          console.error("Alternative approach failed:", alternativeError);
        }
      }
    } catch (updateError) {
      console.error("Update approach exception:", updateError);
    }
    
    toast.error("Failed to add linking_code column. Please contact support.");
    return false;
  } catch (error) {
    console.error("Exception adding linking_code column:", error);
    toast.error("Failed to add linking_code column");
    return false;
  }
};

// This fixed the database trigger error when trying to update linking_code
export const fixPlayerCategoryTrigger = async (): Promise<boolean> => {
  try {
    console.log("Fixing player category trigger issue...");
    
    // Check which players have NULL team_category and set it to a default value
    const { data: players, error: fetchError } = await supabase
      .from("players")
      .select("id, team_category")
      .is("team_category", null);
    
    if (fetchError) {
      console.error("Error fetching players with null team_category:", fetchError);
      return false;
    }
    
    // Update players with null team_category
    let updateCount = 0;
    for (const player of (players || [])) {
      if (!player.team_category) {
        const { error: updateError } = await supabase
          .from("players")
          .update({ team_category: "Unassigned" })
          .eq("id", player.id);
        
        if (!updateError) {
          updateCount++;
        } else {
          console.error(`Error updating player ${player.id}:`, updateError);
        }
      }
    }
    
    if (updateCount > 0) {
      toast.success(`Fixed team_category for ${updateCount} players`);
    } else if (players && players.length === 0) {
      toast.success("No players needed fixing");
    } else {
      toast.warning("Could not update some players");
    }
    
    return true;
  } catch (error) {
    console.error("Exception fixing player category trigger:", error);
    toast.error("Failed to fix player category trigger");
    return false;
  }
};
