
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a column exists in a table
 * @param tableName The name of the table
 * @param columnName The name of the column to check
 * @returns Promise<boolean> True if the column exists
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Use a direct query with RPC instead of a complex query
    const { data, error } = await supabase.rpc('get_table_columns', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error('Error checking column existence:', error);
      return false;
    }
    
    // Check if the column is in the returned array
    if (Array.isArray(data)) {
      return data.includes(columnName);
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Check if a table exists in the database
 * @param tableName The name of the table to check
 * @returns Promise<boolean> True if the table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Use the Supabase function table_exists to check if the table exists
    const { data, error } = await supabase.rpc('table_exists', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error('Error checking table existence:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Export other utility functions here
