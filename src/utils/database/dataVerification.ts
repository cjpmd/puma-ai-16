
import { supabase } from '@/integrations/supabase/client';

/**
 * Verify database connection
 * @returns Promise<boolean> True if database connection is successful
 */
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('players').select('id').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Database connection verification failed:', error);
    return false;
  }
};

/**
 * Verify that a table exists and has a specified row count
 * @param tableName The name of the table to check
 * @param minRowCount Minimum number of rows that should exist
 * @returns Promise<boolean> True if table exists with at least minRowCount rows
 */
export const verifyTableData = async (
  tableName: string,
  minRowCount: number = 1
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error(`Error verifying table ${tableName}:`, error);
      return false;
    }
    
    // Add null check to prevent TS error
    const count = data?.count ?? 0;
    
    if (count < minRowCount) {
      console.warn(`Table ${tableName} has fewer than ${minRowCount} rows`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error verifying table data for ${tableName}:`, error);
    return false;
  }
};

/**
 * Check if a database table has required columns
 * @param tableName The name of the table to check
 * @param requiredColumns Array of column names that should exist in the table
 * @returns Promise<boolean> True if all required columns exist
 */
export const verifyTableColumns = async (
  tableName: string,
  requiredColumns: string[]
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Error getting columns for table ${tableName}:`, error);
      return false;
    }
    
    // Add null check to prevent TS error
    if (data === null) {
      console.error(`No column data returned for table ${tableName}`);
      return false;
    }
    
    const missingColumns = requiredColumns.filter(col => !data.includes(col));
    
    if (missingColumns.length > 0) {
      console.warn(`Table ${tableName} is missing required columns: ${missingColumns.join(', ')}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error verifying table columns for ${tableName}:`, error);
    return false;
  }
};
