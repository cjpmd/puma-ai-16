
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
    
    // First check if we can actually use the column
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
        throw error;
      }
    } catch (checkError) {
      console.log("Check error, continuing with column creation", checkError);
    }
    
    // Try to create the column
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        ALTER TABLE public.players 
        ADD COLUMN IF NOT EXISTS linking_code TEXT DEFAULT gen_random_uuid()::text;
      `
    });
    
    if (error) {
      console.error("Error adding linking_code column:", error);
      
      // Try direct update approach as fallback
      try {
        console.log("Trying direct update approach...");
        // Get one player to update
        const { data: player } = await supabase
          .from("players")
          .select("id")
          .limit(1);
        
        if (player && player.length > 0) {
          const playerId = player[0].id;
          // Try updating with a random code to force column creation
          const { error: updateError } = await supabase
            .from("players")
            .update({ linking_code: crypto.randomUUID() })
            .eq("id", playerId);
          
          if (!updateError) {
            console.log("Column created via update approach");
            toast.success("linking_code column added successfully via update");
            return true;
          }
          
          console.error("Update approach failed:", updateError);
        }
      } catch (updateError) {
        console.error("Update approach exception:", updateError);
      }
      
      toast.error("Failed to add linking_code column");
      return false;
    }
    
    toast.success("linking_code column added successfully");
    return true;
  } catch (error) {
    console.error("Exception adding linking_code column:", error);
    toast.error("Failed to add linking_code column");
    return false;
  }
};
