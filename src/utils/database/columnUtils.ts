
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a column exists in a table
 */
export const columnExists = async (
  tableName: string,
  columnName: string
): Promise<boolean> => {
  try {
    // First check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', tableName)
      .maybeSingle();
    
    if (tableError || !tableExists) {
      console.error(`Table '${tableName}' doesn't exist:`, tableError);
      return false;
    }
    
    // Direct query to information_schema to check column existence
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
      // In case of error, return false so the application will try to create it
      return false;
    }
    
    return !!data;
  } catch (err) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, err);
    // In case of error, return false to prevent blocking app functionality
    return false;
  }
};

/**
 * Check if a table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', tableName)
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
    // In case of error, return false to prevent blocking app functionality
    return false;
  }
};

/**
 * Function to create a column if it doesn't exist
 */
export const createColumnIfNotExists = async (
  tableName: string,
  columnName: string,
  columnDefinition: string
): Promise<boolean> => {
  try {
    // First check if column already exists
    const columnExistsResult = await columnExists(tableName, columnName);
    
    if (columnExistsResult) {
      console.log(`Column ${columnName} already exists in ${tableName}`);
      return true;
    }
    
    // Add the column with the specified definition
    const alterTableSQL = `
      ALTER TABLE public.${tableName}
      ADD COLUMN IF NOT EXISTS ${columnName} ${columnDefinition};
    `;
    
    try {
      const { error } = await supabase.rpc('execute_sql', { sql_string: alterTableSQL });
      
      if (error) throw error;
      
      console.log(`Successfully added ${columnName} to ${tableName}`);
      return true;
    } catch (sqlError) {
      console.error(`Error adding column ${columnName} to ${tableName}:`, sqlError);
      return false;
    }
  } catch (err) {
    console.error(`Error in createColumnIfNotExists:`, err);
    return false;
  }
};
