
import { supabase } from "@/integrations/supabase/client";

/**
 * Safely checks if a column exists in a table without relying on custom SQL functions
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Use a SELECT query with the column to check if it exists
    // If the column doesn't exist, it will throw an error
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    // If there's no error, the column exists
    return !error;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Gets a list of columns for a table
 * This is a fallback implementation if the RPC function doesn't exist
 */
export const getTableColumns = async (tableName: string): Promise<string[]> => {
  try {
    // First try to use the RPC function if it exists
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_table_columns',
      { table_name: tableName }
    );
    
    if (!rpcError && rpcData) {
      return rpcData;
    }
    
    // Fallback: Query one row to get the structure
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
      return Object.keys(data[0]);
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};

/**
 * Adds a column to a table if it doesn't exist
 * This is a fallback implementation if the RPC function doesn't exist
 */
export const addColumnIfNotExists = async (
  tableName: string, 
  columnName: string, 
  columnType: string
) => {
  try {
    // Check if the column already exists
    const exists = await columnExists(tableName, columnName);
    if (exists) {
      console.log(`Column ${columnName} already exists in ${tableName}`);
      return true;
    }

    console.log(`Column ${columnName} doesn't exist in ${tableName}, but we can't add it directly from the client. Using alternative approach.`);
    
    // Since we can't add columns directly from the client,
    // we can inform the application that the column should be treated as existing
    // for the current operation
    
    return false;
  } catch (error) {
    console.error(`Failed to check/add column ${columnName} to ${tableName}:`, error);
    return false;
  }
};
