
import { supabase } from "@/integrations/supabase/client";

export const initializeFixtureTeamSelectionsTable = async () => {
  // Check if the table exists first
  const { data: tablesData, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', 'fixture_team_selections');
  
  if (tablesError) {
    console.error("Error checking table existence:", tablesError);
    return false;
  }
  
  if (!tablesData || tablesData.length === 0) {
    // Table doesn't exist, create it
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS fixture_team_selections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
        team_id TEXT NOT NULL,
        period_id TEXT NOT NULL,
        duration INTEGER,
        performance_category TEXT,
        selections_data JSONB,
        captain_id UUID REFERENCES players(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(fixture_id, team_id, period_id)
      );
    `;
    
    const { error: createError } = await supabase.rpc('run_sql', { sql: createTableSQL });
    if (createError) {
      console.error("Error creating table:", createError);
      return false;
    }
    
    console.log("Table created successfully");
    return true;
  }
  
  // Table exists, check columns and add missing ones
  const { error } = await supabase.rpc('add_missing_columns_to_fixture_team_selections');
  if (error) {
    console.error("Error adding missing columns:", error);
    return false;
  }
  
  console.log("Missing columns added successfully");
  return true;
};
