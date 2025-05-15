
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a column exists in a table
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check for
 * @returns Promise<boolean> Whether the column exists
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName });
    if (error) throw error;
    
    return Array.isArray(data) && data.includes(columnName);
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
    
    // Construct the SQL to add the column
    const defaultClause = defaultValue ? ` DEFAULT ${defaultValue}` : '';
    const sql = `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}${defaultClause};`;
    
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, error);
    return false;
  }
};

/**
 * Ensure the necessary database setup for parent-child linking
 */
export const ensureParentChildLinkingSetup = async (): Promise<boolean> => {
  try {
    // Add is_verified column to player_parents if it doesn't exist
    const parentVerifiedAdded = await addColumnIfNotExists(
      'player_parents',
      'is_verified',
      'BOOLEAN',
      'FALSE'
    );
    
    // Add linking_code column to players if it doesn't exist
    const linkingCodeAdded = await addColumnIfNotExists(
      'players',
      'linking_code',
      'TEXT',
      'gen_random_uuid()::text'
    );
    
    // Add self_linked column to players if it doesn't exist
    const selfLinkedAdded = await addColumnIfNotExists(
      'players',
      'self_linked',
      'BOOLEAN',
      'FALSE'
    );
    
    // Add user_id column to players if it doesn't exist
    const userIdAdded = await addColumnIfNotExists(
      'players',
      'user_id',
      'UUID',
      'NULL'
    );
    
    // Create a unique index on the linking_code column if it doesn't exist
    if (linkingCodeAdded) {
      const indexSql = `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'players_linking_code_idx'
          ) THEN
            CREATE UNIQUE INDEX players_linking_code_idx ON public.players(linking_code);
          END IF;
        END $$;
      `;
      
      await supabase.rpc('execute_sql', { sql_query: indexSql });
    }
    
    return parentVerifiedAdded && linkingCodeAdded && selfLinkedAdded && userIdAdded;
  } catch (error) {
    console.error('Error setting up parent-child linking:', error);
    return false;
  }
};
