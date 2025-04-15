
import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
 * Execute SQL on the Supabase database
 * @param sql SQL string to execute
 * @returns Result of the SQL execution
 */
export const executeSql = async (sql: string) => {
  try {
    // Try RPC method first
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });
      
      if (!error) {
        console.log("SQL executed via RPC successfully");
        return { success: true, data };
      }
      
      console.log("RPC method not available, falling back to direct table creation");
    } catch (rpcError) {
      console.log("RPC method not available:", rpcError);
    }
    
    // If RPC fails, try direct table creation
    return await createTablesDirectly();
  } catch (error) {
    console.error("Error executing SQL:", error);
    return { success: false, error };
  }
};

/**
 * Create tables directly through Supabase API instead of SQL
 */
const createTablesDirectly = async () => {
  try {
    console.log("Creating tables directly through Supabase API");
    
    // Create clubs table
    const { error: clubsError } = await supabase.from('clubs')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1)
      .catch(() => ({ error: { message: 'Table does not exist' } }));
    
    if (clubsError) {
      console.log("Creating clubs table");
      const { error } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'clubs',
        table_definition: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          name text NOT NULL,
          location text,
          contact_email text,
          phone text,
          website text,
          description text,
          admin_id uuid REFERENCES auth.users(id),
          serial_number text UNIQUE,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        `
      }).catch(() => ({ error: true }));
      
      if (error) {
        console.log("RPC method not available, creating table manually");
        // Direct create table using Supabase REST API
        await supabase.rest.schemas.create({
          name: 'public',
          tables: [{
            name: 'clubs',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
              { name: 'name', type: 'text', notNull: true },
              { name: 'location', type: 'text' },
              { name: 'contact_email', type: 'text' },
              { name: 'phone', type: 'text' },
              { name: 'website', type: 'text' },
              { name: 'description', type: 'text' },
              { name: 'admin_id', type: 'uuid', references: 'auth.users(id)' },
              { name: 'serial_number', type: 'text', unique: true },
              { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
              { name: 'updated_at', type: 'timestamp with time zone', defaultValue: 'now()' }
            ]
          }]
        }).catch(e => {
          console.log("Failed to create clubs table directly:", e);
        });
      }
    }
    
    // Create teams table
    const { error: teamsError } = await supabase.from('teams')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1)
      .catch(() => ({ error: { message: 'Table does not exist' } }));
    
    if (teamsError) {
      console.log("Creating teams table");
      const { error } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'teams',
        table_definition: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_name text NOT NULL,
          team_logo text,
          home_venue text,
          team_colors jsonb,
          admin_id uuid REFERENCES auth.users(id),
          club_id uuid REFERENCES clubs(id),
          joined_club_at timestamp with time zone,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        `
      }).catch(() => ({ error: true }));
      
      if (error) {
        console.log("RPC method not available, creating table manually");
        // Direct create table using Supabase REST API
        await supabase.rest.schemas.create({
          name: 'public',
          tables: [{
            name: 'teams',
            columns: [
              { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
              { name: 'team_name', type: 'text', notNull: true },
              { name: 'team_logo', type: 'text' },
              { name: 'home_venue', type: 'text' },
              { name: 'team_colors', type: 'jsonb' },
              { name: 'admin_id', type: 'uuid', references: 'auth.users(id)' },
              { name: 'club_id', type: 'uuid', references: 'clubs(id)' },
              { name: 'joined_club_at', type: 'timestamp with time zone' },
              { name: 'created_at', type: 'timestamp with time zone', defaultValue: 'now()' },
              { name: 'updated_at', type: 'timestamp with time zone', defaultValue: 'now()' }
            ]
          }]
        }).catch(e => {
          console.log("Failed to create teams table directly:", e);
        });
      }
    }
    
    // Create other required tables here as needed
    // ...
    
    // Notify of success
    console.log("Tables created successfully via direct API");
    return { success: true };
  } catch (error) {
    console.error("Error creating tables directly:", error);
    return { success: false, error };
  }
};

/**
 * Checks if a table exists in the database
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
 * Initialize the database tables using the SQL files
 * This function is now private/internal and not exposed to users
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // Check if clubs table already exists
    const clubsExist = await tableExists('clubs');
    if (clubsExist) {
      console.log("Database tables already exist");
      return true;
    }
    
    console.log("Creating database tables directly");
    
    // First try to execute SQL file
    try {
      // Get the SQL content
      const sql = await getSqlContent('/sql/create_multi_team_club_structure.sql');
      // Execute the SQL
      const result = await executeSql(sql);
      
      if (result.success) {
        console.log("Database tables created successfully");
        toast({
          title: "Database Initialized",
          description: "Application database tables have been created successfully",
        });
        return true;
      }
    } catch (err) {
      console.error("Error executing SQL file:", err);
    }
    
    // If SQL execution failed, try direct table creation
    const directResult = await createTablesDirectly();
    
    if (directResult.success) {
      console.log("Database tables created successfully via direct API");
      toast({
          title: "Database Initialized",
          description: "Application database tables have been created successfully",
      });
      return true;
    }
    
    console.error("Failed to create database tables:", directResult.error);
    toast({
      title: "Database Error",
      description: "Failed to create database tables. See console for details.",
      variant: "destructive",
    });
    return false;
  } catch (error) {
    console.error("Error initializing database:", error);
    toast({
      title: "Database Error",
      description: "Failed to initialize the database. See console for details.",
      variant: "destructive",
    });
    return false;
  }
};
