
import { supabase } from "@/integrations/supabase/client";
import { columnExists, ensureColumnExists } from "./columnUtils";

/**
 * Add linking_code column to players table
 */
export const addLinkingCodeColumn = async (): Promise<boolean> => {
  try {
    return await ensureColumnExists('players', 'linking_code', 'text');
  } catch (error) {
    console.error("Error adding linking_code column:", error);
    return false;
  }
};

/**
 * Generate a linking code for a player
 */
export const generateLinkingCode = async (playerId: string): Promise<string | null> => {
  try {
    // Ensure the linking_code column exists
    const hasLinkingCodeColumn = await columnExists('players', 'linking_code');
    
    if (!hasLinkingCodeColumn) {
      const added = await addLinkingCodeColumn();
      if (!added) {
        console.error("Failed to add linking_code column");
        return null;
      }
    }
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the code to the player record
    const { error } = await supabase
      .from('players')
      .update({ linking_code: code })
      .eq('id', playerId);
      
    if (error) {
      console.error("Error saving linking code:", error);
      return null;
    }
    
    return code;
  } catch (error) {
    console.error("Error generating linking code:", error);
    return null;
  }
};

/**
 * Create player_parents table if it doesn't exist
 */
export const createPlayerParentsTable = async (): Promise<boolean> => {
  try {
    // First check if the table already exists
    const { data, error } = await supabase
      .from('player_parents')
      .select('id')
      .limit(1);
      
    if (!error) {
      // Table exists
      return true;
    }
    
    if (error.code !== "42P01") {
      // Some other error occurred
      console.error("Error checking player_parents table:", error);
      return false;
    }
    
    // Execute SQL to create table if needed
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.player_parents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        player_id UUID REFERENCES public.players(id),
        parent_id UUID REFERENCES auth.users(id),
        parent_name TEXT,
        email TEXT,
        phone TEXT,
        is_verified BOOLEAN DEFAULT FALSE
      );
    `;
    
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', { sql_string: createTableSQL });
      
      if (sqlError) {
        console.error("Error creating player_parents table:", sqlError);
        return false;
      }
      
      return true;
    } catch (sqlError) {
      console.error("Error executing SQL to create player_parents table:", sqlError);
      return false;
    }
  } catch (error) {
    console.error("Error creating player_parents table:", error);
    return false;
  }
};
