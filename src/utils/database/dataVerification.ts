
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the provided ID exists in the specified table
 * @param tableName The name of the table to check
 * @param id The ID to check for
 * @returns Promise<boolean> True if the ID exists in the table
 */
export const verifyEntityExists = async (tableName: string, id: string): Promise<boolean> => {
  try {
    // Use a conditional check to avoid the TypeScript error for dynamic table names
    if (['players', 'teams', 'clubs', 'coaches', 'profiles'].includes(tableName)) {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('id')
        .eq('id', id)
        .single();
      
      if (error) {
        console.warn(`Entity with ID ${id} not found in ${tableName}:`, error);
        return false;
      }
      
      return !!data;
    }
    
    // For unsupported tables, use a direct SQL query
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_string: `SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE id = '${id}')`
    });
    
    if (error) {
      console.error(`Error verifying if ID ${id} exists in ${tableName}:`, error);
      return false;
    }
    
    // Parse the result
    return !!data;
  } catch (error) {
    console.error(`Error in verifyEntityExists for ${tableName}:`, error);
    return false;
  }
};

/**
 * Checks if multiple IDs exist in the specified table
 * @param tableName The name of the table to check
 * @param ids Array of IDs to check for
 * @returns Promise<boolean> True if all IDs exist in the table
 */
export const verifyEntitiesExist = async (tableName: string, ids: string[]): Promise<boolean> => {
  try {
    if (ids.length === 0) return true;
    
    // Use a safe approach to handle dynamic table names
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_string: `SELECT COUNT(*) as count FROM ${tableName} WHERE id IN ('${ids.join("','")}')`
    });
    
    if (error) {
      console.error(`Error verifying if IDs exist in ${tableName}:`, error);
      return false;
    }
    
    // Parse the result (count should equal the number of IDs)
    return data?.count === ids.length;
  } catch (error) {
    console.error(`Error in verifyEntitiesExist for ${tableName}:`, error);
    return false;
  }
};
