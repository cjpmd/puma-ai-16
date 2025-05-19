
import { supabase } from "@/integrations/supabase/client";

/**
 * Execute raw SQL queries
 */
export async function executeSql(sqlString: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('execute_sql', { 
      sql_string: sqlString 
    });
    
    if (error) {
      console.error(`Error executing SQL: ${sqlString}`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Exception executing SQL: ${sqlString}`, error);
    return false;
  }
}
