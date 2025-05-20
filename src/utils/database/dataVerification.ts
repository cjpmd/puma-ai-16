
import { supabase } from '@/integrations/supabase/client';

export const verifyRelationships = async (): Promise<number> => {
  try {
    // Use a more generic approach to avoid table name issues
    const { data, error } = await supabase.rpc('count_invalid_relationships');
    
    if (error) {
      console.error('Error verifying relationships:', error);
      return 0;
    }
    
    // Return the count if available, or 0 if not
    return data as number || 0;
  } catch (error) {
    console.error('Exception in verifyRelationships:', error);
    return 0;
  }
};
