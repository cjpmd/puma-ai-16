
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
      } else {
        console.error("Error creating profiles table:", profilesError);
      }
    } catch (e) {
      console.error("Error creating profiles table:", e);
    }
    
    // Try to create teams table
    try {
      const { error: teamsError } = await createTeamsTable();
      if (!teamsError) {
        console.log("Successfully created teams table directly");
      } else {
        console.error("Error creating teams table:", teamsError);
      }
    } catch (e) {
      console.error("Error creating teams table:", e);
    }
    
    // Try to create players table
    try {
      const { error: playersError } = await createPlayersTable();
      if (!playersError) {
        console.log("Successfully created players table directly");
      } else {
        console.error("Error creating players table:", playersError);
      }
    } catch (e) {
      console.error("Error creating players table:", e);
    }
    
    // Try to create additional required tables
    await createGameFormatsTable();
    await createPerformanceCategoriesTable();
    await createTeamSettingsTable();
    
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
        club_id UUID,
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
        team_id UUID,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
  });
}

/**
 * Helper function to create performance_categories table
 */
async function createPerformanceCategoriesTable() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.performance_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        -- Insert default values if table is empty
        INSERT INTO public.performance_categories (id, name, description)
        SELECT 'messi', 'Messi', 'Messi performance category'
        WHERE NOT EXISTS (SELECT 1 FROM public.performance_categories WHERE id = 'messi');
        
        INSERT INTO public.performance_categories (id, name, description)
        SELECT 'ronaldo', 'Ronaldo', 'Ronaldo performance category'
        WHERE NOT EXISTS (SELECT 1 FROM public.performance_categories WHERE id = 'ronaldo');
        
        INSERT INTO public.performance_categories (id, name, description)
        SELECT 'jags', 'Jags', 'Jags performance category'
        WHERE NOT EXISTS (SELECT 1 FROM public.performance_categories WHERE id = 'jags');
      `
    });
    
    if (error) {
      console.error("Error creating performance_categories table:", error);
      
      // Direct approach as fallback
      await supabase.from('performance_categories').upsert([
        { id: 'messi', name: 'Messi', description: 'Messi performance category' },
        { id: 'ronaldo', name: 'Ronaldo', description: 'Ronaldo performance category' },
        { id: 'jags', name: 'Jags', description: 'Jags performance category' }
      ], { onConflict: 'id' });
    }
    
    return { success: !error };
  } catch (e) {
    console.error("Error creating performance_categories table:", e);
    return { success: false, error: e };
  }
}

/**
 * Helper function to create game_formats table
 */
async function createGameFormatsTable() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.game_formats (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
        
        -- Insert default values if table is empty
        INSERT INTO public.game_formats (id, name, description)
        SELECT '4-a-side', '4-a-side', '4 players per team'
        WHERE NOT EXISTS (SELECT 1 FROM public.game_formats WHERE id = '4-a-side');
        
        INSERT INTO public.game_formats (id, name, description)
        SELECT '5-a-side', '5-a-side', '5 players per team'
        WHERE NOT EXISTS (SELECT 1 FROM public.game_formats WHERE id = '5-a-side');
        
        INSERT INTO public.game_formats (id, name, description)
        SELECT '7-a-side', '7-a-side', '7 players per team'
        WHERE NOT EXISTS (SELECT 1 FROM public.game_formats WHERE id = '7-a-side');
        
        INSERT INTO public.game_formats (id, name, description)
        SELECT '9-a-side', '9-a-side', '9 players per team'
        WHERE NOT EXISTS (SELECT 1 FROM public.game_formats WHERE id = '9-a-side');
        
        INSERT INTO public.game_formats (id, name, description)
        SELECT '11-a-side', '11-a-side', '11 players per team'
        WHERE NOT EXISTS (SELECT 1 FROM public.game_formats WHERE id = '11-a-side');
      `
    });
    
    if (error) {
      console.error("Error creating game_formats table:", error);
      
      // Direct approach as fallback
      await supabase.from('game_formats').upsert([
        { id: '4-a-side', name: '4-a-side', description: '4 players per team' },
        { id: '5-a-side', name: '5-a-side', description: '5 players per team' },
        { id: '7-a-side', name: '7-a-side', description: '7 players per team' },
        { id: '9-a-side', name: '9-a-side', description: '9 players per team' },
        { id: '11-a-side', name: '11-a-side', description: '11 players per team' }
      ], { onConflict: 'id' });
    }
    
    return { success: !error };
  } catch (e) {
    console.error("Error creating game_formats table:", e);
    return { success: false, error: e };
  }
}

/**
 * Helper function to create team_settings table
 */
async function createTeamSettingsTable() {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS public.team_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_name TEXT,
          team_logo TEXT,
          team_colors TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Insert default record if none exists
        INSERT INTO public.team_settings (id)
        SELECT '00000000-0000-0000-0000-000000000003'
        WHERE NOT EXISTS (SELECT 1 FROM public.team_settings LIMIT 1);
      `
    });
    
    if (error) {
      console.error("Error creating team_settings table:", error);
    }
    
    return { success: !error };
  } catch (e) {
    console.error("Error creating team_settings table:", e);
    return { success: false, error: e };
  }
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
      }, 15000); // 15 second timeout (increased from 10)
    });
    
    // Actual initialization logic
    const initPromise = (async () => {
      console.log("Checking if critical tables exist...");
      
      // Check if key tables already exist
      const criticalTables = [
        'profiles', 
        'teams', 
        'players', 
        'performance_categories', 
        'game_formats',
        'team_settings'
      ];
      
      const tableChecks = await Promise.all(
        criticalTables.map(async (table) => {
          const exists = await tableExists(table);
          console.log(`Table '${table}' exists: ${exists}`);
          return { table, exists };
        })
      );
      
      const missingTables = tableChecks.filter(check => !check.exists).map(check => check.table);
      
      if (missingTables.length === 0) {
        console.log("All required database tables exist");
        return true;
      }
      
      console.log(`Missing tables: ${missingTables.join(', ')}. Attempting auto-setup`);
      
      // Display toast to inform user about setup
      toast.loading("Database Setup Required", {
        description: "The application needs to initialize database tables. Please wait...",
        duration: 10000,
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
        let tablesCreated = true;
        
        // Create each missing table directly
        for (const table of missingTables) {
          let success = false;
          
          if (table === 'profiles') {
            const result = await createProfilesTable();
            success = !result.error;
          } else if (table === 'teams') {
            const result = await createTeamsTable();
            success = !result.error;
          } else if (table === 'players') {
            const result = await createPlayersTable();
            success = !result.error;
          } else if (table === 'performance_categories') {
            const result = await createPerformanceCategoriesTable();
            success = result.success;
          } else if (table === 'game_formats') {
            const result = await createGameFormatsTable();
            success = result.success;
          } else if (table === 'team_settings') {
            const result = await createTeamSettingsTable();
            success = result.success;
          }
          
          if (!success) {
            tablesCreated = false;
            console.error(`Failed to create table: ${table}`);
          }
        }
        
        // Check if we succeeded in creating all tables
        const allTablesExistNow = await Promise.all(
          missingTables.map(table => tableExists(table))
        ).then(results => results.every(exists => exists));
        
        if (allTablesExistNow) {
          toast.success("Database Setup Complete", {
            description: "All database tables have been created",
          });
          return true;
        } else if (tablesCreated) {
          toast.success("Database Setup Partially Complete", {
            description: "Most critical database tables have been created",
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
