
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a column exists in a given table
 * @param table The table name to check
 * @param column The column name to check
 * @returns Promise<boolean> whether the column exists
 */
export const columnExists = async (table: string, column: string): Promise<boolean> => {
  try {
    // Try direct query approach first
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', table)
      .eq('column_name', column);
    
    if (error) {
      console.error(`Error checking if column ${column} exists in table ${table}:`, error);
      
      // If the direct query fails, try a test query on the table with the column
      try {
        const { data: testData, error: testError } = await supabase
          .from(table)
          .select(column)
          .limit(1);
        
        return !testError; // If no error, column exists
      } catch (testQueryError) {
        console.error(`Test query failed for ${table}.${column}:`, testQueryError);
        return false;
      }
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${column} exists in table ${table}:`, error);
    return false;
  }
};

/**
 * Checks if a table exists in the database
 * @param table The table name to check
 * @returns Promise<boolean> whether the table exists
 */
export const tableExists = async (table: string): Promise<boolean> => {
  try {
    // Try direct query approach first
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', table);
    
    if (error) {
      console.error(`Error checking if table ${table} exists:`, error);
      
      // If the direct query fails, try a test query on the table
      try {
        const { data: testData, error: testError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        return !testError || testError.code !== '42P01'; // If no error or error is not "table does not exist"
      } catch (testQueryError: any) {
        // Check if the error is specifically about the table not existing
        return testQueryError.code !== '42P01';
      }
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${table} exists:`, error);
    return false;
  }
};
