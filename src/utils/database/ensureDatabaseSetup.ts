
import { supabase } from '@/integrations/supabase/client';
import { createUserRolesTable } from './setupUserRolesTable';
import { setupSecurityPolicies } from './setupSecurityPolicies';
import { addColumnIfNotExists } from './columnManagement';
import { columnExists } from './columnUtils';

export const ensureDatabaseSetup = async (): Promise<boolean> => {
  try {
    // Setup user roles table
    await createUserRolesTable();
    
    // Setup RLS policies
    await setupSecurityPolicies();
    
    // Check if the profile_image column exists in the players table
    const hasProfileImageColumn = await columnExists('players', 'profile_image');
    
    if (!hasProfileImageColumn) {
      const profileImageAdded = await addColumnIfNotExists(
        'players', 
        'profile_image', 
        'TEXT'
      );
      
      if (profileImageAdded) {
        console.log('Added profile_image column to players table');
      }
    }
    
    // Check if linking_code column exists in the players table
    const hasLinkingCodeColumn = await columnExists('players', 'linking_code');
    
    if (!hasLinkingCodeColumn) {
      const linkingCodeAdded = await addColumnIfNotExists(
        'players', 
        'linking_code', 
        'TEXT'
      );
      
      if (linkingCodeAdded) {
        console.log('Added linking_code column to players table');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring database setup:', error);
    return false;
  }
};
