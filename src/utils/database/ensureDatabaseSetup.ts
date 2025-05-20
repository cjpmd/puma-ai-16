
import { supabase } from '@/integrations/supabase/client';
import { setupUserRolesTable } from './setupUserRolesTable';
import { setupSecurityPolicies } from './setupSecurityPolicies';
import { addColumnIfNotExists } from './columnManagement';
import { tableExists } from './columnUtils';

export const ensureDatabaseSetup = async (): Promise<boolean> => {
  try {
    // Setup user roles table
    await setupUserRolesTable();
    
    // Setup RLS policies
    await setupSecurityPolicies();
    
    // Check if the profile_image column exists in the players table
    const hasProfileImageColumn = await tableExists('players');
    
    if (hasProfileImageColumn) {
      const profileImageAdded = await addColumnIfNotExists(
        'players', 
        'profile_image', 
        'TEXT'
      );
      
      if (profileImageAdded) {
        console.log('Added profile_image column to players table');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring database setup:', error);
    return false;
  }
};
