
import { supabase } from "@/integrations/supabase/client";

/**
 * Add linking_code column to players table
 */
export const addLinkingCodeColumn = async (): Promise<boolean> => {
  try {
    // Check if players table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'players')
      .single();
    
    if (tableError) {
      console.error("Error checking players table:", tableError);
      return false;
    }
    
    // First check if column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'players')
      .eq('column_name', 'linking_code');
    
    if (columnsError) {
      console.error("Error checking linking_code column:", columnsError);
      return false;
    }
    
    // If column already exists, return true
    if (columns && columns.length > 0) {
      console.log("Linking code column already exists");
      return true;
    }
    
    // Try to add column using RPC
    const addColumnSQL = `
      ALTER TABLE public.players
      ADD COLUMN IF NOT EXISTS linking_code text;
    `;
    
    try {
      await supabase.rpc('execute_sql', { sql_string: addColumnSQL });
      console.log("Successfully added linking_code column");
      return true;
    } catch (rpcError) {
      console.error("Failed to add linking_code column via RPC:", rpcError);
      
      // Alternative approach - create a PostgreSQL function that adds the column
      const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION add_linking_code_column()
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        ALTER TABLE public.players
        ADD COLUMN IF NOT EXISTS linking_code text;
        RETURN TRUE;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN FALSE;
      END;
      $$;
      `;
      
      try {
        // Create the function and then call it
        await supabase.rpc('execute_sql', { sql_string: createFunctionSQL });
        await supabase.rpc('add_linking_code_column');
        return true;
      } catch (fnError) {
        console.error("Failed to create helper function:", fnError);
        return false;
      }
    }
  } catch (error) {
    console.error("Error adding linking_code column:", error);
    return false;
  }
};
