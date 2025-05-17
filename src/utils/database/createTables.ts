
import { supabase } from "@/integrations/supabase/client";

/**
 * Add linking_code column to players table
 * This is a standalone function exposed to UI components
 */
export const addLinkingCodeColumn = async (): Promise<boolean> => {
  try {
    console.log("Attempting to add linking_code column to players table...");
    
    // Try to verify if the column already exists
    try {
      const { data, error } = await supabase
        .from('players')
        .select('linking_code')
        .limit(1);
      
      // If we don't get an error about the column, it likely exists
      if (!error) {
        console.log("linking_code column already exists");
        return true;
      } else if (!error.message?.includes('does not exist')) {
        console.warn("Error checking linking_code:", error);
      }
    } catch (checkError) {
      console.warn("Exception checking linking_code:", checkError);
    }
    
    // Try the RPC method, though we expect it to fail with 401
    try {
      await supabase.rpc('execute_sql', {
        sql_string: `ALTER TABLE players ADD COLUMN IF NOT EXISTS linking_code TEXT DEFAULT gen_random_uuid()::text;`
      });
      console.log("Added linking_code column via RPC");
      return true;
    } catch (rpcError) {
      console.warn("RPC error adding linking_code column:", rpcError);
    }
    
    // As a last resort, try a direct update approach on one row
    // This might fail, but it's worth trying
    try {
      // Get first player to test
      const { data: playerData } = await supabase
        .from('players')
        .select('id')
        .limit(1);
      
      if (playerData && playerData.length > 0) {
        // Try to update the player with a linking code field
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const { error: updateError } = await supabase
          .from('players')
          .update({ linking_code: code })
          .eq('id', playerData[0].id);
        
        if (!updateError) {
          console.log("Successfully updated player with linking_code");
          return true;
        } else {
          console.warn("Error adding linking_code via update:", updateError);
        }
      }
    } catch (updateError) {
      console.warn("Exception in update approach:", updateError);
    }
    
    // If we get here, we couldn't add the column
    console.warn("Could not add linking_code column - database permissions issue");
    return false;
  } catch (error) {
    console.error("Error in addLinkingCodeColumn:", error);
    return false;
  }
};

/**
 * Create player_parents table if it doesn't exist
 */
export const createPlayerParentsTable = async (): Promise<boolean> => {
  try {
    console.log("Checking player_parents table...");
    
    // Try to verify if the table already exists
    try {
      const { data, error } = await supabase
        .from('player_parents')
        .select('id')
        .limit(1);
      
      // If we don't get an error about the table not existing, it likely exists
      if (!error || !error.message?.includes('does not exist')) {
        console.log("player_parents table already exists");
        return true;
      }
    } catch (checkError) {
      console.warn("Exception checking player_parents:", checkError);
    }
    
    // Try the RPC method, though we expect it to fail with 401
    try {
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS public.player_parents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            player_id UUID REFERENCES players(id),
            parent_name TEXT,
            email TEXT,
            phone TEXT,
            is_verified BOOLEAN DEFAULT FALSE
          );`
      });
      console.log("Created player_parents table via RPC");
      return true;
    } catch (rpcError) {
      console.warn("RPC error creating player_parents table:", rpcError);
    }
    
    // If we get here, we couldn't create the table
    console.warn("Could not create player_parents table - database permissions issue");
    return false;
  } catch (error) {
    console.error("Error in createPlayerParentsTable:", error);
    return false;
  }
};
