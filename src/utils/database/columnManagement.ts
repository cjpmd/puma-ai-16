
import { supabase } from '@/integrations/supabase/client';
import { columnExists } from './columnUtils';

/**
 * Add a column to a table if it doesn't exist
 * @param tableName The name of the table
 * @param columnName The name of the column to add
 * @param columnType The PostgreSQL data type for the column
 * @returns Promise<boolean> True if the column was added, false otherwise
 */
export const addColumnIfNotExists = async (tableName: string, columnName: string, columnType: string): Promise<boolean> => {
  try {
    // First check if the column exists
    const exists = await columnExists(tableName, columnName);
    
    if (!exists) {
      // Column doesn't exist, so add it
      const { error } = await supabase.rpc('execute_sql', {
        sql_string: `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`
      });
      
      if (error) {
        console.error(`Error adding column ${columnName} to ${tableName}:`, error);
        return false;
      }
      
      console.log(`Added column ${columnName} to ${tableName}`);
      return true;
    }
    
    // Column already exists
    console.log(`Column ${columnName} already exists in ${tableName}`);
    return false;
  } catch (error) {
    console.error(`Error in addColumnIfNotExists for ${columnName} in ${tableName}:`, error);
    return false;
  }
};

// Export other column management functions here
