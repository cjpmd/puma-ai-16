
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a table exists in the database
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Exception checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Check if a column exists in a table
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .single();
    
    if (error) {
      console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Exception checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  }
}

/**
 * Create a column if it doesn't already exist
 */
export async function createColumnIfNotExists(
  tableName: string, 
  columnName: string, 
  columnType: string
): Promise<boolean> {
  try {
    // First check if the column already exists
    const columnAlreadyExists = await columnExists(tableName, columnName);
    
    if (columnAlreadyExists) {
      console.log(`Column ${columnName} already exists in table ${tableName}`);
      return true;
    }
    
    // Create the column if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};`
    });
    
    if (error) {
      console.error(`Error adding column ${columnName} to table ${tableName}:`, error);
      return false;
    }
    
    console.log(`Successfully added column ${columnName} to table ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Exception in createColumnIfNotExists:`, error);
    return false;
  }
}
