
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced column existence check with proper error handling and multiple approaches
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    console.log(`Checking if column ${columnName} exists in ${tableName}...`);
    
    // First approach: Try a direct select of the column
    return await checkColumnBySelect(tableName, columnName);
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Check column existence by attempting to select it
 */
async function checkColumnBySelect(tableName: string, columnName: string): Promise<boolean> {
  try {
    console.log(`Testing column ${columnName} in ${tableName} via select query`);
    
    // We build a dynamic select that only includes the target column
    const selectObject: Record<string, string> = {};
    selectObject[columnName] = columnName;
    
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    // If no error, the column exists
    if (!error) {
      console.log(`Column ${columnName} exists in ${tableName} (query check: true)`);
      return true;
    }
    
    // Check if error indicates column doesn't exist
    if (error.message.includes(`column "${columnName}" does not exist`) || 
        error.message.includes(`${columnName}' does not exist`)) {
      console.log(`Column ${columnName} does not exist in ${tableName} (query check: false)`);
      return false;
    }
    
    // For other errors, log but assume column doesn't exist
    console.error(`Error checking column by select:`, error);
    return false;
  } catch (error) {
    console.error(`Exception in checkColumnBySelect:`, error);
    return false;
  }
}

/**
 * Gets a list of columns for a table with enhanced error handling
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
      console.log(`Retrieved columns for ${tableName} from row:`, columns);
      return columns;
    }
    
    // If no rows, try an empty insert/select to get column structure
    try {
      const { data: emptyData, error: emptyError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (!emptyError && emptyData) {
        // May return column metadata even without rows
        const columns = Object.keys(emptyData);
        if (columns.length > 0) {
          console.log(`Retrieved columns for ${tableName} from empty response:`, columns);
          return columns;
        }
      }
    } catch (emptyError) {
      console.error(`Failed to get empty columns for ${tableName}:`, emptyError);
    }
    
    console.log(`No data found for ${tableName} to determine columns`);
    return [];
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};
