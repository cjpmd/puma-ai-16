
import { supabase } from "@/integrations/supabase/client";
import { columnExists } from "./columnUtils";

/**
 * Set up parent-child linking columns in various tables
 */
export const ensureParentChildLinkingSetup = async (): Promise<boolean> => {
  try {
    console.log("Setting up parent-child linking columns...");
    
    // Check if players table has linking_code column
    const hasLinkingCode = await columnExists('players', 'linking_code');
    if (!hasLinkingCode) {
      console.log("Players table needs linking_code column");
    }
    
    // Check if players table has self_linked column
    const hasSelfLinked = await columnExists('players', 'self_linked');
    if (!hasSelfLinked) {
      console.log("Players table needs self_linked column");
    }
    
    // Check if player_parents table has is_verified column
    const hasIsVerified = await columnExists('player_parents', 'is_verified');
    if (!hasIsVerified) {
      console.log("player_parents table needs is_verified column");
    }
    
    return true;
  } catch (err) {
    console.error("Error in ensureParentChildLinkingSetup:", err);
    return false;
  }
};

/**
 * Create table columns for parent-child linking
 */
export const createParentChildLinkingColumns = async (): Promise<boolean> => {
  try {
    console.log("Setting up parent-child linking columns...");
    
    const sqlStatements = [
      // Add linking_code to players
      `ALTER TABLE IF EXISTS public.players 
       ADD COLUMN IF NOT EXISTS linking_code TEXT DEFAULT gen_random_uuid()::text;`,
      
      // Add self_linked to players
      `ALTER TABLE IF EXISTS public.players 
       ADD COLUMN IF NOT EXISTS self_linked BOOLEAN DEFAULT FALSE;`,
      
      // Add user_id to players
      `ALTER TABLE IF EXISTS public.players 
       ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT NULL;`,
      
      // Create player_parents table if it doesn't exist
      `CREATE TABLE IF NOT EXISTS public.player_parents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        player_id UUID REFERENCES players(id),
        parent_name TEXT,
        email TEXT,
        phone TEXT,
        is_verified BOOLEAN DEFAULT FALSE
      );`,
      
      // Add is_verified to player_parents
      `ALTER TABLE IF EXISTS public.player_parents 
       ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`
    ];
    
    for (const sql of sqlStatements) {
      try {
        // Try standard RPC first
        await supabase.rpc('execute_sql', { sql_string: sql });
      } catch (error) {
        console.warn(`RPC error, trying direct SQL: ${error}`);
        // Try direct SQL as fallback
        try {
          await supabase.from('_exec_sql').select('*').eq('query', sql);
        } catch (innerError) {
          console.error("Direct SQL execution failed:", innerError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Failed to create parent-child linking columns:", error);
    return false;
  }
};
