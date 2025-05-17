
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a user's role directly, bypassing any enum constraints
 * This is used when the role value might not be in the database enum yet
 */
export const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    console.log(`Attempting to update user ${userId} role to ${role}`);
    
    // First try with RPC method
    try {
      console.log('Trying RPC update_user_role_raw method...');
      const { error } = await supabase.rpc('update_user_role_raw', {
        p_user_id: userId,
        p_role: role
      });
      
      if (!error) {
        console.log('RPC update successful');
        return true;
      }
      
      console.warn('RPC update_user_role_raw failed:', error);
    } catch (rpcError) {
      console.warn('RPC method failed:', rpcError);
    }
    
    // Try with direct update as a fallback
    console.log('Trying direct SQL update...');
    const { error: sqlError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId);
      
    if (sqlError) {
      console.error('Direct update failed:', sqlError);
      
      // As another fallback, try a raw SQL query
      try {
        console.log('Trying raw SQL update via RPC...');
        const { error: rawSqlError } = await supabase.rpc('execute_sql', { 
          sql_string: `UPDATE profiles SET role = '${role}' WHERE id = '${userId}'` 
        });
        
        if (rawSqlError) {
          console.error('Raw SQL update failed:', rawSqlError);
          return false;
        }
        
        console.log('Raw SQL update successful');
        return true;
      } catch (rawSqlError) {
        console.error('Raw SQL method failed:', rawSqlError);
        return false;
      }
    }
    
    console.log('Direct SQL update successful');
    return true;
  } catch (error) {
    console.error('Error in updateUserRole:', error);
    return false;
  }
};
