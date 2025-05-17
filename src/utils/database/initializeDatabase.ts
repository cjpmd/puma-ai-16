
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createParentChildLinkingColumns } from "./parentChildLinking";

// Define the SQL function to execute arbitrary SQL
const createExecuteSqlFunction = `
CREATE OR REPLACE FUNCTION execute_sql(sql_string TEXT) RETURNS VOID AS $$
BEGIN
  EXECUTE sql_string;
END;
$$ LANGUAGE plpgsql;
`;

// Function to create necessary tables and functions
export async function initializeDatabase(): Promise<boolean> {
  console.log("Starting database initialization...");
  toast.info("Initializing database...");
  
  try {
    // First try to create the execute_sql function which we'll need
    try {
      await supabase.rpc('execute_sql', { sql_string: createExecuteSqlFunction });
    } catch (error) {
      console.warn("Failed to create execute_sql function via RPC, trying direct query");
      
      // If RPC fails, try to create it through direct SQL (though this might not work either)
      try {
        await supabase.from('_exec_sql').select('*').eq('query', createExecuteSqlFunction);
      } catch (innerError) {
        console.error("Failed to create execute_sql function:", innerError);
      }
    }
    
    // Continue with creating needed tables and columns
    // Function to create a table if it doesn't exist
    const createTableIfNotExists = async (tableName: string, columns: string) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS public."${tableName}" (
          ${columns}
        );
      `;
      try {
        await supabase.rpc('execute_sql', { sql_string: sql });
        console.log(`Table "${tableName}" created successfully.`);
      } catch (error) {
        console.error(`Error creating table "${tableName}":`, error);
        toast.error(`Error creating table "${tableName}"`);
      }
    };

    // Create the profiles table
    await createTableIfNotExists(
      'profiles',
      `
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        updated_at TIMESTAMP WITH TIME ZONE,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        website TEXT,
        CONSTRAINT username_length CHECK (char_length(username) >= 3)
      `
    );

    // Create the teams table
    await createTableIfNotExists(
      'teams',
      `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        team_name TEXT,
        club_id UUID,
        age_group TEXT
      `
    );

    // Create the players table
    await createTableIfNotExists(
      'players',
      `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        name TEXT,
        age INT,
        squad_number INT,
        team_category TEXT,
        date_of_birth DATE,
        player_type TEXT,
        status TEXT DEFAULT 'active',
        profile_image TEXT
      `
    );

    // Create the performance_categories table
    await createTableIfNotExists(
      'performance_categories',
      `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        category_name TEXT
      `
    );

    // Create the game_formats table
    await createTableIfNotExists(
      'game_formats',
      `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        format_name TEXT
      `
    );

    // Create the team_settings table
    await createTableIfNotExists(
      'team_settings',
      `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        team_id UUID,
        game_format_id UUID,
        performance_category_id UUID
      `
    );
    
    // Create player_transfers table
    await createTableIfNotExists(
      'player_transfers',
      `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        player_id UUID REFERENCES players(id),
        from_team_id UUID REFERENCES teams(id),
        to_team_id UUID REFERENCES teams(id),
        status TEXT DEFAULT 'pending',
        type TEXT NOT NULL,
        reason TEXT
      `
    );
    
    // Create parent-child linking columns
    await createParentChildLinkingColumns();
    
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    toast.error("Database initialization failed");
    return false;
  }
}

