
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a column exists in a table
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check for
 * @returns Promise<boolean> True if the column exists, false otherwise
 */
export const columnExists = async (tableName: string, columnName?: string): Promise<boolean> => {
  try {
    if (columnName) {
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_string: `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = '${tableName}'
            AND column_name = '${columnName}'
          );
        `
      });
      
      if (error) {
        console.error("Error checking if column exists:", error);
        return false;
      }
      
      // The result comes back as a boolean value
      return data === true;
    } else {
      // If no column name is provided, check if the table exists
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_string: `
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_name = '${tableName}'
          );
        `
      });
      
      if (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
      }
      
      return data === true;
    }
  } catch (err) {
    console.error("Error in columnExists function:", err);
    return false;
  }
};

/**
 * Check if a table exists
 * @param tableName The name of the table to check
 * @returns Promise<boolean> True if the table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('table_exists', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error(`Error in tableExists: ${error}`);
    return false;
  }
};
