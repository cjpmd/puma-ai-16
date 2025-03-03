import { supabase } from "@/integrations/supabase/client";

/**
 * Adds a column to a table if it doesn't exist
 */
export const addColumnIfNotExists = async (
  tableName: string, 
  columnName: string, 
  columnType: string
) => {
  try {
    // First check if the function exists in the database
    const { data: funcExists, error: funcError } = await supabase.rpc(
      'function_exists',
      { function_name: 'add_column_if_not_exists' }
    );
    
    if (funcError) {
      console.error("Error checking if function exists:", funcError);
      return false;
    }
    
    if (!funcExists) {
      console.error("The add_column_if_not_exists function doesn't exist in the database");
      return false;
    }
    
    // Call the function to add the column if it doesn't exist
    const { data, error } = await supabase.rpc(
      'add_column_if_not_exists',
      { 
        p_table_name: tableName,
        p_column_name: columnName,
        p_column_type: columnType
      }
    );
    
    if (error) {
      console.error(`Error adding column ${columnName} to ${tableName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to add column ${columnName} to ${tableName}:`, error);
    return false;
  }
};

/**
 * Gets a list of columns for a table
 */
export const getTableColumns = async (tableName: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc(
      'get_table_columns',
      { table_name: tableName }
    );
    
    if (error) {
      console.error(`Error getting columns for ${tableName}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};
