
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
    
    // Then check if column exists using RPC if available
    try {
      const { data, error } = await supabase.rpc(
        'check_column_exists',
        { p_table: tableName, p_column: columnName }
      );
      
      if (error) throw error;
      return !!data;
    } catch (rpcError) {
      // Fallback to direct query if RPC fails
      console.warn('RPC check_column_exists failed, using fallback:', rpcError);
      
      const { data, error } = await supabase.from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .eq('column_name', columnName)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    }
  } catch (err) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, err);
    // In case of error, return true to prevent blocking app functionality
    return true;
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
    // In case of error, return true to prevent blocking app functionality
    return true;
  }
};
