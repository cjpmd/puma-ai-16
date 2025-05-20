
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a column exists in a table
 * @param tableName The name of the table to check
 * @param columnName The name of the column to check
 * @returns Promise<boolean> True if the column exists
 */
export const columnExists = async (tableName: string, columnName?: string): Promise<boolean> => {
  try {
    // Use a type assertion for the table name to avoid TypeScript errors with dynamic table names
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Error checking column existence in table ${tableName}:`, error);
      return false;
    }
    
    if (!data) {
      console.error(`Table ${tableName} might not exist`);
      return false;
    }
    
    // If columnName is provided, check if it exists in the table
    if (columnName) {
      return data.includes(columnName);
    }
    
    // If only tableName is provided, check if table exists
    return data.length > 0;
  } catch (error) {
    console.error(`Error checking column existence: ${error}`);
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
