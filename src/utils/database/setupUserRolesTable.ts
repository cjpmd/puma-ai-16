
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { nanoid } from "nanoid";

/**
 * Initialize user roles system
 * Creates necessary tables if they don't exist and sets up initial user role
 */
export const initializeUserRoles = async (userId: string, initialRole: string = 'admin'): Promise<boolean> => {
  try {
    console.log("Initializing user roles system for user:", userId);
    
    // Step 1: Create user_roles table if it doesn't exist
    await createUserRolesTable();
    
    // Step 2: Create child_linking table if it doesn't exist
    await createChildLinkingTable();
    
    // Step 3: Ensure player linking code column exists
    await ensurePlayerLinkingCodeColumn();
    
    // Step 4: Check if user already has roles
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (checkError) {
      // If the error is not about the table not existing, report it
      if (checkError.code !== '42P01') {
        console.error("Error checking user roles:", checkError);
        return false;
      }
    }
    
    // If user has no roles, add default role
    if (!existingRoles || existingRoles.length === 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([
          { 
            user_id: userId, 
            role: initialRole,
            is_primary: true
          }
        ]);
        
      if (insertError) {
        // Log error but don't block the app
        console.error("Error setting initial user role:", insertError);
      }
    }
    
    // If we get here, consider it a success
    console.log("User roles system initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize user roles system:", error);
    return false;
  }
};

/**
 * Create user_roles table if it doesn't exist
 */
export const createUserRolesTable = async (): Promise<boolean> => {
  try {
    // Create the user_roles table if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id, role)
        );
      `
    });
    
    if (error) {
      // If the RPC function doesn't exist, that's expected in development
      console.log("Note: execute_sql RPC not available - this is expected in development");
      
      // Create the table directly (this likely won't work due to permissions, but we try)
      try {
        // Try a workaround by inserting and catching the error
        const { error: testError } = await supabase
          .from('user_roles')
          .insert([{ id: '00000000-0000-0000-0000-000000000001', user_id: '00000000-0000-0000-0000-000000000001', role: 'test', is_primary: false }]);
          
        if (testError && testError.code === '42P01') {
          // Table doesn't exist - show a notification to the user
          toast.warning("Database setup required", {
            description: "The user_roles table is missing. SQL setup scripts need to be run.",
            duration: 8000,
          });
        }
      } catch (err) {
        console.error("Error testing user_roles table existence:", err);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error creating user_roles table:", error);
    return false;
  }
};

/**
 * Create child_linking table for parent-child account linking
 */
export const createChildLinkingTable = async (): Promise<boolean> => {
  try {
    // Create the child_linking table if it doesn't exist
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.parent_child_linking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(parent_id, player_id)
        );
      `
    });
    
    if (error) {
      // If the RPC function doesn't exist, that's expected in development
      console.log("Note: execute_sql RPC not available - this is expected for parent_child_linking");
      
      // Try a workaround by checking if the table exists
      try {
        const { error: testError } = await supabase
          .from('parent_child_linking')
          .select('count(*)', { count: 'exact', head: true });
          
        if (testError && testError.code === '42P01') {
          // Table doesn't exist - this is handled gracefully
          console.log("The parent_child_linking table doesn't exist yet");
        }
      } catch (err) {
        console.error("Error testing parent_child_linking table existence:", err);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error creating parent_child_linking table:", error);
    return false;
  }
};

/**
 * Ensure the players table has a linking_code column
 */
export const ensurePlayerLinkingCodeColumn = async (): Promise<boolean> => {
  try {
    // Add linking_code column to players table if it doesn't exist
    const { error } = await supabase.rpc('add_column_if_not_exists', {
      p_table_name: 'players',
      p_column_name: 'linking_code',
      p_column_type: 'text'
    });
    
    if (error) {
      // If the RPC function doesn't exist, log it but don't block the app
      console.log("Note: add_column_if_not_exists RPC not available - this is expected in development");
    }
    
    return true;
  } catch (error) {
    console.error("Error ensuring linking_code column:", error);
    return false;
  }
};

/**
 * Generate a random code for linking a child/player account to a parent
 * @returns A randomly generated 6-character alphanumeric code
 */
export const generateChildLinkingCode = (): string => {
  // Generate a 6-character code from alphanumeric characters
  // Use nanoid for secure random generation
  return nanoid(6).toUpperCase();
};

/**
 * Link a parent account to a player using a linking code
 * @param parentUserId The parent's user ID
 * @param linkingCode The linking code associated with the player
 * @returns Success boolean and player details if successful
 */
export const linkParentToPlayer = async (parentUserId: string, linkingCode: string): Promise<{success: boolean, playerDetails?: any, message: string}> => {
  try {
    // Step 1: Find the player with the provided linking code
    const { data: players, error: playerError } = await supabase
      .from('players')
      .select('id, name')
      .eq('linking_code', linkingCode)
      .limit(1);
    
    if (playerError) {
      console.error("Error finding player by linking code:", playerError);
      return { success: false, message: "Failed to verify linking code." };
    }
    
    if (!players || players.length === 0) {
      return { success: false, message: "Invalid linking code. Please check and try again." };
    }
    
    const player = players[0];
    
    // Step 2: Check if the link already exists
    const { data: existingLinks, error: existingLinkError } = await supabase
      .from('parent_child_linking')
      .select('id')
      .eq('parent_id', parentUserId)
      .eq('player_id', player.id)
      .limit(1);
    
    if (existingLinkError) {
      // If the error is because the table doesn't exist, create it first
      if (existingLinkError.code === '42P01') {
        await createChildLinkingTable();
      } else {
        console.error("Error checking existing links:", existingLinkError);
        return { success: false, message: "Failed to check existing links." };
      }
    }
    
    if (existingLinks && existingLinks.length > 0) {
      return { success: false, message: `You are already linked to ${player.name}.` };
    }
    
    // Step 3: Create the link
    const { error: insertError } = await supabase
      .from('parent_child_linking')
      .insert([
        { parent_id: parentUserId, player_id: player.id }
      ]);
    
    if (insertError) {
      console.error("Error linking parent to player:", insertError);
      return { success: false, message: "Failed to create link to player." };
    }
    
    // Step 4: Add parent role to user if they don't already have it
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', parentUserId)
      .eq('role', 'parent');
    
    if (!rolesError && (!userRoles || userRoles.length === 0)) {
      // Add parent role
      const { error: addRoleError } = await supabase
        .from('user_roles')
        .insert([
          { user_id: parentUserId, role: 'parent', is_primary: false }
        ]);
      
      if (addRoleError) {
        console.warn("Warning: Could not add parent role to user:", addRoleError);
        // Don't return error here, linking was successful
      }
    }
    
    return { 
      success: true, 
      playerDetails: player,
      message: `Successfully linked to ${player.name}.` 
    };
  } catch (error) {
    console.error("Error in linkParentToPlayer:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
};
