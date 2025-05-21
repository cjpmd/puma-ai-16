
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a column exists in a table
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check for
 * @returns Promise<boolean> True if the column exists, false otherwise
 */
export const columnExists = async (tableName: string, columnName?: string): Promise<boolean> => {
  try {
    // First check if table exists
    const tableExistsCheck = await tableExists(tableName);
    if (!tableExistsCheck) {
      console.log(`Table ${tableName} does not exist`);
      return false;
    }

    if (columnName) {
      // Check for specific column
      try {
        // Try using function first if available
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
        
        if (!error) {
          return data === true;
        } else {
          console.log("execute_sql RPC not available - this is expected in development");
          
          // Fallback to direct select if function fails
          const { data: columnData, error: columnError } = await supabase
            .from(tableName)
            .select(columnName)
            .limit(1);
          
          return !columnError;
        }
      } catch (err) {
        console.error("Error checking if column exists:", err);
        return false;
      }
    } else {
      // If no column name is provided, we've already checked that the table exists
      return true;
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
    // First try using the table_exists RPC if available
    try {
      const { data, error } = await supabase.rpc('table_exists', {
        table_name: tableName
      });
      
      if (!error) {
        return Boolean(data);
      } else {
        console.log("table_exists RPC not available - this is expected in development");
      }
    } catch (rpcError) {
      console.log("RPC method not available:", rpcError);
    }
    
    // Fallback method - try selecting from the table
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      // If there's no error, the table exists
      return !error;
    } catch (selectError) {
      console.error(`Error checking if table ${tableName} exists:`, selectError);
      return false;
    }
  } catch (error) {
    console.error(`Error in tableExists: ${error}`);
    return false;
  }
};
