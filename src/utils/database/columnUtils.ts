
import { supabase } from "@/integrations/supabase/client";
import { executeSql } from "./executeSql";

/**
 * Enhanced column existence check with proper error handling and detailed logging
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    console.log(`Checking if column ${columnName} exists in ${tableName}...`);
    
    // Manual approach - directly query the information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      console.error(`Error querying information schema:`, error);
      
      // Fallback approach - try to select the column
      const { error: selectError } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(1);
      
      const exists = !selectError;
      console.log(`Column ${columnName} exists in ${tableName} (query check): ${exists}`);
      
      if (selectError) {
        console.error(`Error checking column existence: ${selectError.message}`);
      }
      
      return exists;
    }
    
    const exists = data && data.length > 0;
    console.log(`Column ${columnName} exists in ${tableName} (schema check): ${exists}`);
    return exists;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Gets a list of columns for a table with enhanced error handling
 */
export const getTableColumns = async (tableName: string): Promise<string[]> => {
  try {
    console.log(`Getting columns for ${tableName}...`);
    
    // Direct query to information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`Error querying information schema:`, error);
      
      // Fallback: Try querying one row to get the structure
      const { data: rowData, error: rowError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (rowError) {
        console.error(`Error getting columns for ${tableName}:`, rowError);
        return [];
      }
      
      // If data exists, get the keys from the first row
      if (rowData && rowData.length > 0) {
        const columns = Object.keys(rowData[0]);
        console.log(`Retrieved columns for ${tableName} from row:`, columns);
        return columns;
      }
      
      console.log(`No data found for ${tableName} to determine columns`);
      return [];
    }
    
    const columns = data.map(col => col.column_name);
    console.log(`Retrieved columns for ${tableName}:`, columns);
    return columns;
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};
