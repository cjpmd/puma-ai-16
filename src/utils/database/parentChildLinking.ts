
import { supabase } from "@/integrations/supabase/client";
import { tableExists, columnExists } from "./columnUtils";

// Create parent-child linking
export const createParentChildLink = async (
  parentId: string,
  playerId: string
) => {
  try {
    const { data, error } = await supabase
      .from('parent_child_linking')
      .insert({
        parent_id: parentId,
        player_id: playerId
      });
      
    if (error) {
      console.error('Error creating parent-child link:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception in createParentChildLink:', err);
    return false;
  }
};

// Generate linking code for parent-child connection
export const generateChildLinkingCode = async (playerId: string): Promise<string | null> => {
  try {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the code to the player record
    const { error } = await supabase
      .from('players')
      .update({ linking_code: code })
      .eq('id', playerId);
      
    if (error) {
      console.error('Error generating child linking code:', error);
      return null;
    }
    
    return code;
  } catch (error) {
    console.error('Exception in generateChildLinkingCode:', error);
    return null;
  }
};

// Get children linked to a parent
export const getLinkedChildren = async (parentId: string) => {
  try {
    const { data, error } = await supabase
      .from('parent_child_linking')
      .select(`
        player_id,
        players:player_id (*)
      `)
      .eq('parent_id', parentId);
      
    if (error) {
      console.error('Error getting linked children:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getLinkedChildren:', err);
    return [];
  }
};

// Create player_parents table if it doesn't exist
export const createPlayerParentsTable = async (): Promise<boolean> => {
  try {
    try {
      // Check if the table already exists by querying it
      const { data, error } = await supabase
        .from('player_parents')
        .select('id')
        .limit(1);
        
      if (!error) {
        // Table exists
        return true;
      }
    } catch (checkError) {
      console.log('Error checking player_parents table:', checkError);
    }
    
    // Execute SQL to create table
    try {
      const { error: sqlError } = await supabase.rpc('execute_sql', { 
        sql_string: `
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
        `
      });
      
      if (sqlError) {
        console.error('Error creating player_parents table:', sqlError);
        return false;
      }
      
      return true;
    } catch (sqlError) {
      console.error('Error executing SQL to create player_parents table:', sqlError);
      return false;
    }
  } catch (error) {
    console.error('Exception in createPlayerParentsTable:', error);
    return false;
  }
};

/**
 * Ensure parent-child linking columns and tables are set up properly
 * This verifies the linking_code column exists in players table and creates it if needed
 */
export const ensureParentChildLinkingSetup = async (): Promise<boolean> => {
  try {
    // Step 1: Check if the parent_child_linking table exists
    const parentChildTableExists = await tableExists('parent_child_linking');
    
    if (!parentChildTableExists) {
      console.log("Creating parent_child_linking table...");
      const { error: createTableError } = await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS public.parent_child_linking (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            parent_id UUID REFERENCES auth.users(id),
            player_id UUID REFERENCES public.players(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      });
      
      if (createTableError) {
        console.error("Error creating parent_child_linking table:", createTableError);
        return false;
      }
    }
    
    // Step 2: Check if linking_code column exists in players table
    const linkingCodeExists = await columnExists('players', 'linking_code');
    
    if (!linkingCodeExists) {
      console.log("Adding linking_code column to players table...");
      const { error: addColumnError } = await supabase.rpc('execute_sql', {
        sql_string: `
          ALTER TABLE public.players 
          ADD COLUMN IF NOT EXISTS linking_code TEXT;
        `
      });
      
      if (addColumnError) {
        console.error("Error adding linking_code column:", addColumnError);
        return false;
      }
    }
    
    // Step 3: Ensure player_parents table exists
    const playerParentsCreated = await createPlayerParentsTable();
    if (!playerParentsCreated) {
      console.warn("Failed to ensure player_parents table exists");
    }
    
    return true;
  } catch (error) {
    console.error("Error in ensureParentChildLinkingSetup:", error);
    return false;
  }
};
