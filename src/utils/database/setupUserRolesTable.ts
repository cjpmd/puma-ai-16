import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Creates the user_roles table if it doesn't exist
 */
export const setupUserRolesTable = async (): Promise<boolean> => {
  try {
    console.log("Checking if user_roles table exists");
    
    // Try to select from the user_roles table to test if it exists
    const { error } = await supabase
      .from('user_roles')
      .select('id')
      .limit(1);
    
    // If no error, table exists
    if (!error) {
      console.log("user_roles table exists");
      return true;
    }
    
    // If error indicates table doesn't exist, create it
    if (error.message.includes('relation "user_roles" does not exist')) {
      console.log("user_roles table doesn't exist, creating...");
      
      try {
        const { error: createError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.user_roles (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
              role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'coach', 'parent')),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, role)
            );
            
            -- Add RLS policies for the table
            ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
            
            -- Policy to allow users to read their own roles
            CREATE POLICY "Users can read their own roles"
              ON public.user_roles
              FOR SELECT
              USING (auth.uid() = user_id);
              
            -- Policy to allow users to insert their own roles
            CREATE POLICY "Users can insert their own roles"
              ON public.user_roles
              FOR INSERT
              WITH CHECK (auth.uid() = user_id);
          `
        });
        
        if (createError) {
          console.error("Error creating user_roles table:", createError);
          return false;
        }
        
        console.log("Successfully created user_roles table");
        return true;
      } catch (createErr) {
        console.error("Error in creating user_roles table:", createErr);
        return false;
      }
    }
    
    // Other errors
    console.error("Error checking user_roles table:", error);
    return false;
  } catch (err) {
    console.error("Exception in setupUserRolesTable:", err);
    return false;
  }
};

/**
 * Migrates user roles from profiles table to user_roles table
 */
export const migrateUserRoles = async (userId: string, currentRole: string): Promise<boolean> => {
  try {
    console.log(`Migrating roles for user ${userId}`);
    
    // Check if user already has roles in the new table
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (checkError) {
      console.error("Error checking existing roles:", checkError);
      return false;
    }
    
    // If user already has roles, don't migrate
    if (existingRoles && existingRoles.length > 0) {
      console.log(`User ${userId} already has roles in user_roles table`);
      return true;
    }
    
    // Insert the user's current role into the new table
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role: currentRole }]);
    
    if (insertError) {
      console.error("Error migrating user role:", insertError);
      return false;
    }
    
    console.log(`Successfully migrated role '${currentRole}' for user ${userId}`);
    return true;
  } catch (err) {
    console.error("Exception in migrateUserRoles:", err);
    return false;
  }
};

/**
 * Initialize the roles system for the current user
 */
export const initializeUserRoles = async (userId: string, currentRole: string): Promise<boolean> => {
  // Setup table first
  const tableCreated = await setupUserRolesTable();
  if (!tableCreated) {
    console.error("Failed to setup user_roles table");
    return false;
  }
  
  // Migrate roles
  const migrated = await migrateUserRoles(userId, currentRole);
  return migrated;
};
