
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's role directly, bypassing any enum constraints
 * This is used when the role value might not be in the database enum yet
 */
export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // First try to use the RPC if it's available
    let { error } = await supabase.rpc('update_user_role', {
      p_user_id: userId,
      p_role: role
    });
    
    if (error) {
      console.warn('RPC update_user_role failed:', error);
      
      // Try direct SQL update as fallback
      const { error: directError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
        
      if (directError) {
        console.error('Direct update failed:', directError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};
