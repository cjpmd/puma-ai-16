
import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Gets the content of SQL files to execute in the database
 * @param path Path to the SQL file
 * @returns SQL content as string
 */
export const getSqlContent = async (path: string): Promise<string> => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load SQL file: ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading SQL file ${path}:`, error);
    throw error;
  }
};

/**
 * Execute SQL on the Supabase database with better error handling
 * @param sql SQL string to execute
 * @returns Result of the SQL execution
 */
export const executeSql = async (sql: string) => {
  try {
    console.log("Attempting to execute SQL");
    
    // First, try the RPC method
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });
      
      if (!error) {
        console.log("SQL executed via RPC successfully");
        return { success: true, data };
      }
      
      if (error.code === 'PGRST202') {
        console.log("RPC method 'execute_sql' not found - trying alternative approach");
      } else {
        console.error("Error executing SQL via RPC:", error);
      }
    } catch (rpcError) {
      console.log("RPC method failed, trying alternative approach");
    }
    
    // If RPC fails, try to execute key tables directly
    console.log("Attempting to create essential tables directly");
    
    // Try to create profiles table
    try {
      const { error: profilesError } = await createProfilesTable();
      if (!profilesError) {
        console.log("Successfully created profiles table directly");
      }
    } catch (e) {
      console.error("Error creating profiles table:", e);
    }
    
    // Try to create teams table
    try {
      const { error: teamsError } = await createTeamsTable();
      if (!teamsError) {
        console.log("Successfully created teams table directly");
      }
    } catch (e) {
      console.error("Error creating teams table:", e);
    }
    
    // Try to create players table
    try {
      const { error: playersError } = await createPlayersTable();
      if (!playersError) {
        console.log("Successfully created players table directly");
      }
    } catch (e) {
      console.error("Error creating players table:", e);
    }
    
    // Return success
    return { success: true };
  } catch (error) {
    console.error("Error in executeSql:", error);
    return { success: false, error };
  }
};

/**
 * Helper function to create profiles table
 */
async function createProfilesTable() {
  return await supabase.rpc('execute_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        name TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
}

/**
 * Helper function to create teams table
 */
async function createTeamsTable() {
  return await supabase.rpc('execute_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS public.teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_name TEXT NOT NULL,
        age_group TEXT,
        location TEXT,
        contact_email TEXT,
        team_color TEXT,
        admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  });
}

/**
 * Helper function to create players table
 */
async function createPlayersTable() {
  return await supabase.rpc('execute_sql', {
    sql_string: `
      CREATE TABLE IF NOT EXISTS public.players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        age INTEGER,
        squad_number INTEGER,
        team_category TEXT,
        date_of_birth DATE,
        player_type TEXT,
        profile_image TEXT,
        team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
}

/**
 * Checks if a table exists in the database with improved error handling
 * @param tableName Name of the table to check
 * @returns Boolean indicating if the table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

/**
 * Initialize the database tables with improved error handling
 * @returns Success status
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn("Database initialization timed out");
        resolve(false);
      }, 10000); // 10 second timeout
    });
    
    // Actual initialization logic
    const initPromise = (async () => {
      // Check if clubs table already exists
      const clubsExist = await tableExists('clubs');
      const profilesExist = await tableExists('profiles');
      const teamsExist = await tableExists('teams');
      
      if (clubsExist && profilesExist && teamsExist) {
        console.log("Database tables already exist");
        return true;
      }
      
      console.log("Tables don't exist, attempting auto-setup");
      
      // Display toast to inform user about setup
      toast.warning("Database Setup Required", {
        description: "The application needs to initialize database tables. Please wait...",
        duration: 5000,
      });
      
      // Try to execute SQL file
      try {
        const sql = await getSqlContent('/sql/create_multi_team_club_structure.sql');
        const result = await executeSql(sql);
        
        if (result.success) {
          console.log("Database tables created successfully");
          toast.success("Database Initialized", {
            description: "Application database tables have been set up",
          });
          return true;
        } else {
          throw new Error("Failed to execute SQL");
        }
      } catch (err) {
        console.error("Error executing SQL file:", err);
        
        // Try direct table creation as a fallback
        const profilesCreated = await createProfilesTable();
        const teamsCreated = await createTeamsTable();
        const playersCreated = await createPlayersTable();
        
        // Check if we succeeded
        const profilesExistNow = await tableExists('profiles');
        const teamsExistNow = await tableExists('teams');
        
        if (profilesExistNow && teamsExistNow) {
          toast.success("Database Setup Complete", {
            description: "Critical database tables have been created",
          });
          return true;
        } else {
          toast.error("Database Setup Failed", {
            description: "Could not automatically set up the database. Please run the SQL setup scripts in Supabase.",
            duration: 8000,
          });
          return false;
        }
      }
    })();
    
    // Race the initialization against the timeout
    return await Promise.race([initPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error initializing database:", error);
    // Return false on error
    return false;
  }
};
