
import { supabase } from "@/integrations/supabase/client";

/**
 * Manage database columns for players
 */
export const ensurePlayerColumns = async () => {
  try {
    // Create SQL statement to add linking_code column if it doesn't exist
    const sql = `
      ALTER TABLE public.players 
      ADD COLUMN IF NOT EXISTS linking_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;
    `;
    
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error ensuring player columns:', error);
    return false;
  }
};
