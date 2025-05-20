
import { supabase } from '@/integrations/supabase/client';

export const verifyRelationships = async (): Promise<number> => {
  try {
    // Use a more generic approach to avoid table name issues
    const { data, error } = await supabase.rpc('count_invalid_relationships');
    
    if (error) {
      console.error('Error verifying relationships:', error);
      return 0;
    }
    
    // Make sure we convert to number properly
    if (typeof data === 'number') {
      return data;
    } else if (data !== null && data !== undefined) {
      // Convert any non-null value to a number, or return 0 if conversion fails
      return Number(data) || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Exception in verifyRelationships:', error);
    return 0;
  }
};
