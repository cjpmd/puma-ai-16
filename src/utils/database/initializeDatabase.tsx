
import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Execute SQL on the Supabase database with better error handling
 */
export const executeSql = async (sql: string) => {
  try {
    console.log("Executing SQL statements directly");
    
    // Create required tables directly instead of trying to load SQL file
    await createCriticalTables();
    
    return { success: true };
  } catch (error) {
    console.error("Error in executeSql:", error);
    return { success: false, error };
  }
};

/**
 * Create all critical tables directly
 */
async function createCriticalTables() {
  // Create profiles table
  await supabase.rpc('execute_sql', {
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
  }).catch(err => console.log('Profiles table may already exist:', err?.message));
  
  // Create teams table
  await supabase.rpc('execute_sql', {
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
        team_logo TEXT,
        subscription_status TEXT DEFAULT 'trial',
        subscription_expiry TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  }).catch(err => console.log('Teams table may already exist:', err?.message));
  
  // Create players table
  await supabase.rpc('execute_sql', {
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
  }).catch(err => console.log('Players table may already exist:', err?.message));
  
  // Create game_formats table
  await supabase.rpc('execute_sql', {
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
  }).catch(err => console.log('Game formats table may already exist:', err?.message));
  
  // Create performance_categories table
  await supabase.rpc('execute_sql', {
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
  }).catch(err => console.log('Performance categories table may already exist:', err?.message));
  
  // Create team_settings table
  await supabase.rpc('execute_sql', {
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
  }).catch(err => console.log('Team settings table may already exist:', err?.message));
}

/**
 * Checks if a table exists in the database with improved error handling
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

/**
 * Initialize the database tables
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn("Database initialization timed out");
        resolve(false);
      }, 15000); // 15 second timeout
    });
    
    // Actual initialization logic
    const initPromise = (async () => {
      console.log("Starting database initialization...");
      
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
      
      console.log(`Missing tables: ${missingTables.join(', ')}. Attempting creation...`);
      toast("Database Setup Required", {
        description: "The application needs to initialize database tables. Please wait...",
        duration: 10000,
      });
      
      // Create tables directly
      const result = await createCriticalTables();
      
      // Re-check tables after creation
      const tablesNowExist = await Promise.all(
        missingTables.map(async table => {
          const exists = await tableExists(table);
          return { table, exists };
        })
      );
      
      const stillMissingTables = tablesNowExist
        .filter(check => !check.exists)
        .map(check => check.table);
      
      if (stillMissingTables.length === 0) {
        toast.success("Database Initialized", {
          description: "All database tables have been created successfully",
        });
        return true;
      } else {
        console.warn(`Failed to create tables: ${stillMissingTables.join(', ')}`);
        toast.error("Database Initialization Incomplete", {
          description: `Could not create all tables. Missing: ${stillMissingTables.join(', ')}`,
        });
        return false;
      }
    })();
    
    // Race the initialization against the timeout
    return await Promise.race([initPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error initializing database:", error);
    toast.error("Database Error", {
      description: "Failed to initialize database tables. See console for details.",
    });
    return false;
  }
};
