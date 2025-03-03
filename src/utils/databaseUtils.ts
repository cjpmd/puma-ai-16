
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a column exists in a table without relying on custom SQL functions
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    console.log(`Checking if column ${columnName} exists in ${tableName}...`);
    
    // Use a SELECT query with the column to check if it exists
    // If the column doesn't exist, it will throw an error
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    // If there's no error, the column exists
    const exists = !error;
    console.log(`Column ${columnName} exists in ${tableName}: ${exists}`);
    
    if (error) {
      console.error(`Error checking column existence: ${error.message}`);
    }
    
    return exists;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    // Assume column exists if we can't confirm - safer approach for updates
    return true;
  }
};

/**
 * Gets a list of columns for a table
 * This is a fallback implementation if the RPC function doesn't exist
 */
export const getTableColumns = async (tableName: string): Promise<string[]> => {
  try {
    console.log(`Getting columns for ${tableName}...`);
    
    // Try querying one row to get the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error getting columns for ${tableName}:`, error);
      return [];
    }
    
    // If data exists, get the keys from the first row
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`Retrieved columns for ${tableName}:`, columns);
      return columns;
    }
    
    // Try an empty insert to get column names (will be rolled back)
    const { error: insertError, data: insertData } = await supabase.rpc(
      'get_table_columns',
      { table_name: tableName }
    );
    
    if (!insertError && insertData) {
      console.log(`Retrieved columns via RPC for ${tableName}:`, insertData);
      return insertData;
    }
    
    console.log(`No data found for ${tableName} to determine columns`);
    return [];
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};

/**
 * Ensures a column exists in a table
 * In client-side code we can only check, not create columns
 */
export const ensureColumnExists = async (
  tableName: string, 
  columnName: string
): Promise<boolean> => {
  try {
    console.log(`Ensuring column ${columnName} exists in ${tableName}...`);
    
    // Check if the column already exists
    const exists = await columnExists(tableName, columnName);
    console.log(`Column check result for ${columnName} in ${tableName}: ${exists}`);
    
    return exists;
  } catch (error) {
    console.error(`Error ensuring column ${columnName} exists in ${tableName}:`, error);
    // Assume true to allow operations to continue
    return true;
  }
};

/**
 * Add column if not exists (client-side version)
 * This is a compatibility function that just checks column existence
 */
export const addColumnIfNotExists = async (
  tableName: string, 
  columnName: string, 
  columnType: string
): Promise<boolean> => {
  return ensureColumnExists(tableName, columnName);
};
