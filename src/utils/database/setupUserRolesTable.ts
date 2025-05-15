
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize user roles system for a user
 * @param userId The user's ID
 * @param primaryRole The user's primary role
 * @returns Promise<boolean> Success status
 */
export const initializeUserRoles = async (userId: string, primaryRole: string): Promise<boolean> => {
  try {
    // First, check if the user_roles table exists
    const { data: tableExists, error: checkError } = await supabase.rpc(
      'function_exists',
      { function_name: 'is_role_assigned' }
    );

    if (checkError) {
      console.error('Error checking for function:', checkError);
      
      // Create the user_roles table and function if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'coach', 'parent')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, role)
        );

        -- Create function to check if a role is assigned to a user
        CREATE OR REPLACE FUNCTION public.is_role_assigned(p_user_id UUID, p_role TEXT)
        RETURNS BOOLEAN AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = p_user_id AND role = p_role
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Add linking_code column to players table if it doesn't exist
        ALTER TABLE public.players
        ADD COLUMN IF NOT EXISTS linking_code TEXT UNIQUE DEFAULT gen_random_uuid()::text;
      `;
      
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql_query: createTableQuery
      });
      
      if (createError) {
        console.error('Error creating user_roles table:', createError);
        return false;
      }
    }

    // Check if the user already has entries in the user_roles table
    const { data: existingRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (rolesError) {
      if (rolesError.message.includes('relation "user_roles" does not exist')) {
        console.error('User roles table still does not exist after creation attempt');
      } else {
        console.error('Error checking user roles:', rolesError);
      }
      return false;
    }

    // If user has no roles, add their primary role
    if (!existingRoles || existingRoles.length === 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: primaryRole });
      
      if (insertError) {
        console.error('Error inserting user role:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in initializeUserRoles:', error);
    return false;
  }
};

/**
 * Generate a child linking code
 * @returns string A unique code for child linking
 */
export const generateChildLinkingCode = (): string => {
  // Generate a 6-character alphanumeric code
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
