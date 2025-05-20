
import { supabase } from '@/integrations/supabase/client';

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
