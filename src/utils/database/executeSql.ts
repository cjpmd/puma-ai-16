
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct SQL execution for critical database operations
 */
export const executeSql = async (sql: string): Promise<boolean> => {
  try {
    console.log(`Executing SQL: ${sql}`);
    const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });
    
    if (error) {
      console.error(`SQL execution error:`, error);
      return false;
    }
    
    console.log(`SQL execution result:`, data);
    return true;
  } catch (error) {
    console.error(`Exception during SQL execution:`, error);
    return false;
  }
};
