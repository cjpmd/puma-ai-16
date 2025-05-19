
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a column exists in a table
 */
export const columnExists = async (
  tableName: string,
  columnName: string
): Promise<boolean> => {
  try {
    // Execute SQL function to check if column exists
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_string: `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = '${tableName}'
          AND column_name = '${columnName}'
        ) as column_exists;
      `
    });
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
      return false;
    }
    
    return data && data.length > 0 && data[0].column_exists === true;
  } catch (err) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, err);
    return false;
  }
};

/**
 * Check if a table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Execute SQL function to check if table exists
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_string: `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        ) as table_exists;
      `
    });
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0 && data[0].table_exists === true;
  } catch (err) {
    console.error(`Error checking if table ${tableName} exists:`, err);
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
