
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's role directly, bypassing any enum constraints
 * This is used when the role value might not be in the database enum yet
 */
export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // Use a raw SQL query to bypass enum constraints
    const { error } = await supabase.rpc('update_user_role_raw', {
      p_user_id: userId,
      p_role: role
    });
    
    if (error) {
      console.warn('RPC update_user_role_raw failed:', error);
      
      // Try with PostgreSQL's type casting as a fallback
      const { error: sqlError } = await supabase
        .from('profiles')
        .update({ role: role }, { returning: 'minimal' })
        .eq('id', userId);
        
      if (sqlError) {
        console.error('Direct update with casting failed:', sqlError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};
