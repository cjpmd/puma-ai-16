
import { supabase } from '@/integrations/supabase/client';

export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // First check if the table exists
    const { data: tableCheck, error: tableError } = await supabase.rpc('table_exists', { table_name: tableName });
    
    if (tableError || !tableCheck) {
      console.error('Error checking table existence:', tableError);
      return false;
    }
    
    // Then check if the column exists in the table
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', { table_name: tableName });
    
    if (columnsError) {
      console.error('Error fetching table columns:', columnsError);
      return false;
    }
    
    // Safely check if data exists and contains the column
    if (columns && Array.isArray(columns)) {
      return columns.includes(columnName);
    }
    
    return false;
  } catch (error) {
    console.error('Exception in columnExists:', error);
    return false;
  }
};

export const verifyRelationships = async (): Promise<number> => {
  try {
    // Query for checking invalid relationships
    const { data, error } = await supabase
      .from('invalid_relationships_view')
      .select('count');
    
    if (error) {
      console.error('Error verifying relationships:', error);
      return 0;
    }
    
    // Safely check if data exists and return the count
    if (data && Array.isArray(data) && data.length > 0 && 'count' in data[0]) {
      return data[0].count as number;
    }
    
    return 0;
  } catch (error) {
    console.error('Exception in verifyRelationships:', error);
    return 0;
  }
};
