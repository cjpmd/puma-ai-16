
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a table exists in the database
 * @param tableName The name of the table to check
 * @returns True if the table exists, false otherwise
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName)
      .select('*')
      .limit(1);
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Checks if a column exists in a table
 * @param tableName The name of the table
 * @param columnName The name of the column
 * @returns True if the column exists, false otherwise
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName });
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
      return false;
    }
    
    return data ? data.includes(columnName) : false;
  } catch (error) {
    console.error(`Unexpected error checking column ${columnName} in ${tableName}:`, error);
    return false;
  }
}

/**
 * Adds a column to a table if it doesn't exist
 * @param tableName The name of the table
 * @param columnName The name of the column
 * @param columnType The SQL type of the column
 * @returns True if the column was added or already exists, false on error
 */
export async function ensureColumnExists(
  tableName: string, 
  columnName: string, 
  columnType: string
): Promise<boolean> {
  try {
    // First check if column exists
    const exists = await columnExists(tableName, columnName);
    
    if (!exists) {
      // If column doesn't exist, add it
      const { error } = await supabase.rpc('add_column_if_not_exists', {
        p_table_name: tableName,
        p_column_name: columnName,
        p_column_type: columnType
      });
      
      if (error) {
        console.error(`Error adding column ${columnName} to ${tableName}:`, error);
        return false;
      }
      
      console.log(`Added column ${columnName} to ${tableName}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Unexpected error ensuring column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
}
