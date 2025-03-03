
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced column existence check with proper error handling and detailed logging
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    console.log(`Checking if column ${columnName} exists in ${tableName}...`);
    
    // Use metadata API to check if column exists
    const { data: columns, error: metadataError } = await supabase
      .rpc('get_table_columns', { table_name: tableName });
    
    if (!metadataError && columns) {
      const exists = columns.includes(columnName);
      console.log(`Column ${columnName} exists in ${tableName} (metadata check): ${exists}`);
      return exists;
    }
    
    console.log(`Metadata check failed, falling back to SELECT query...`);
    
    // Fallback: Try to select the column (might fail if it doesn't exist)
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    const exists = !error;
    console.log(`Column ${columnName} exists in ${tableName} (query check): ${exists}`);
    
    if (error) {
      console.error(`Error checking column existence: ${error.message}`);
    }
    
    return exists;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    // Return false when we can't confirm - safer approach for updates
    return false;
  }
};

/**
 * Gets a list of columns for a table with enhanced error handling
 */
export const getTableColumns = async (tableName: string): Promise<string[]> => {
  try {
    console.log(`Getting columns for ${tableName}...`);
    
    // Try using the RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_table_columns',
      { table_name: tableName }
    );
    
    if (!rpcError && rpcData) {
      console.log(`Retrieved columns via RPC for ${tableName}:`, rpcData);
      return rpcData;
    }
    
    console.log(`RPC failed, falling back to query method:`, rpcError);
    
    // Fallback: Try querying one row to get the structure
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
    
    console.log(`No data found for ${tableName} to determine columns`);
    return [];
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};

/**
 * Ensures a column exists in a table with improved logging and error handling
 */
export const ensureColumnExists = async (
  tableName: string, 
  columnName: string
): Promise<boolean> => {
  try {
    console.log(`Ensuring column ${columnName} exists in ${tableName}...`);
    
    // Try checking with columnExists first
    const exists = await columnExists(tableName, columnName);
    console.log(`Column check result for ${columnName} in ${tableName}: ${exists}`);
    
    if (!exists) {
      console.log(`Column ${columnName} not found in ${tableName}, checking if we need to add it...`);
      try {
        // Try to verify if the column should be added using RPC function
        const { data: added, error: addError } = await supabase.rpc(
          'add_column_if_not_exists',
          { 
            p_table_name: tableName,
            p_column_name: columnName,
            p_column_type: 'text'  // Default to text type for profile_image
          }
        );
        
        if (addError) {
          console.error(`Error adding column via RPC: ${addError.message}`);
          return false;
        }
        
        console.log(`Column add attempt result: ${added}`);
        return true;
      } catch (addError) {
        console.error(`Failed to add column ${columnName} to ${tableName}:`, addError);
        return false;
      }
    }
    
    return exists;
  } catch (error) {
    console.error(`Error ensuring column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Directly checks if a table has a specific value in a column for a specific record
 * Useful for verifying if data was saved correctly
 */
export const verifyDataSaved = async (
  tableName: string,
  columnName: string,
  recordId: string,
  expectedValue: any
): Promise<boolean> => {
  try {
    console.log(`Verifying data saved in ${tableName}.${columnName} for record ${recordId}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', recordId)
      .single();
    
    if (error) {
      console.error(`Error verifying saved data: ${error.message}`);
      return false;
    }
    
    const saved = data && data[columnName] === expectedValue;
    console.log(`Data verification result: ${saved}`, data);
    return saved;
  } catch (error) {
    console.error(`Error verifying data save:`, error);
    return false;
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
  try {
    // Try to use RPC function first
    const { data, error } = await supabase.rpc(
      'add_column_if_not_exists',
      { 
        p_table_name: tableName,
        p_column_name: columnName,
        p_column_type: columnType
      }
    );
    
    if (!error) {
      console.log(`Column add attempt successful: ${data}`);
      return true;
    }
    
    console.error(`RPC error: ${error.message}, falling back to check-only`);
    return ensureColumnExists(tableName, columnName);
  } catch (error) {
    console.error(`Error in addColumnIfNotExists:`, error);
    return false;
  }
};
