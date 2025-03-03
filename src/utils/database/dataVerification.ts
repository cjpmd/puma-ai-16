
import { supabase } from "@/integrations/supabase/client";

/**
 * Directly checks if a table has a specific value in a column for a specific record
 * Useful for verifying if data was saved correctly
 */
export const verifyDataSaved = async (
  tableName: string,
  columnName: string,
  recordId: string,
  expectedValue: any
): Promise<boolean> => {
  try {
    console.log(`Verifying data saved in ${tableName}.${columnName} for record ${recordId}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', recordId)
      .single();
    
    if (error) {
      console.error(`Error verifying saved data: ${error.message}`);
      return false;
    }
    
    const saved = data && data[columnName] === expectedValue;
    console.log(`Data verification result: ${saved}`, data);
    return saved;
  } catch (error) {
    console.error(`Error verifying data save:`, error);
    return false;
  }
};
