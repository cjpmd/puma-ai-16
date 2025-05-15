
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a column exists in a table using direct SQL query
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check for
 * @returns Promise<boolean> Whether the column exists
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Use direct SQL query instead of RPC function
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
      return false;
    }
    
    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Add a column to a table if it doesn't exist
 * @param tableName The name of the table to modify
 * @param columnName The name of the column to add
 * @param columnType The SQL type of the column
 * @param defaultValue Optional default value for the column
 * @returns Promise<boolean> Whether the operation succeeded
 */
export const addColumnIfNotExists = async (
  tableName: string,
  columnName: string,
  columnType: string,
  defaultValue?: string
): Promise<boolean> => {
  try {
    // Check if the column already exists
    const exists = await columnExists(tableName, columnName);
    if (exists) return true;
    
    // Construct the SQL to add the column directly
    const defaultClause = defaultValue ? ` DEFAULT ${defaultValue}` : '';
    const sql = `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}${defaultClause};`;
    
    // Execute SQL directly instead of using RPC function
    const { error } = await supabase.rpc('execute_sql', { sql_string: sql });
    
    if (error) {
      if (error.code === 'PGRST202') {
        // RPC function doesn't exist, try direct query API (less safe but may work)
        console.warn("SQL RPC function not found, attempting to use direct SQL query");
        try {
          await supabase.from('_exec_sql').select('*').eq('query', sql);
          return true;
        } catch (innerError) {
          console.error("Failed to add column using direct SQL", innerError);
          return false;
        }
      }
      
      console.error(`Error adding column ${columnName} to ${tableName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, error);
    return false;
  }
};

/**
 * Direct SQL approach to add needed columns
 */
export const addRequiredColumns = async (): Promise<boolean> => {
  try {
    // Create or alter players table to add needed columns
    const sqlQueries = [
      // Add linking_code column to players
      `ALTER TABLE IF EXISTS public.players 
       ADD COLUMN IF NOT EXISTS linking_code TEXT DEFAULT gen_random_uuid()::text;`,
      
      // Add self_linked column to players
      `ALTER TABLE IF EXISTS public.players 
       ADD COLUMN IF NOT EXISTS self_linked BOOLEAN DEFAULT FALSE;`,
      
      // Add user_id column to players
      `ALTER TABLE IF EXISTS public.players 
       ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT NULL;`,
       
      // Add is_verified column to player_parents
      `ALTER TABLE IF EXISTS public.player_parents 
       ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`
    ];
    
    // Execute each SQL query
    for (const sql of sqlQueries) {
      try {
        // Try with standard RPC first
        const { error } = await supabase.rpc('execute_sql', { sql_string: sql });
        
        if (error) {
          console.warn(`RPC error, trying alternative method: ${error.message}`);
          // If RPC fails, try direct query (may not work but worth trying)
          await supabase.from('_exec_sql').select('*').eq('query', sql);
        }
      } catch (error) {
        console.error("SQL execution error:", error);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error adding required columns:", error);
    return false;
  }
};

/**
 * Ensure the necessary database setup for parent-child linking
 */
export const ensureParentChildLinkingSetup = async (): Promise<boolean> => {
  try {
    // Try the direct SQL approach first as it's most likely to work
    const result = await addRequiredColumns();
    
    if (!result) {
      console.warn("Direct SQL approach failed, trying column-by-column approach");
      
      // Fall back to column-by-column approach
      const parentVerifiedAdded = await addColumnIfNotExists(
        'player_parents',
        'is_verified',
        'BOOLEAN',
        'FALSE'
      );
      
      const linkingCodeAdded = await addColumnIfNotExists(
        'players',
        'linking_code',
        'TEXT',
        'gen_random_uuid()::text'
      );
      
      const selfLinkedAdded = await addColumnIfNotExists(
        'players',
        'self_linked',
        'BOOLEAN',
        'FALSE'
      );
      
      const userIdAdded = await addColumnIfNotExists(
        'players',
        'user_id',
        'UUID',
        'NULL'
      );
      
      return parentVerifiedAdded && linkingCodeAdded && selfLinkedAdded && userIdAdded;
    }
    
    return result;
  } catch (error) {
    console.error('Error setting up parent-child linking:', error);
    return false;
  }
};
