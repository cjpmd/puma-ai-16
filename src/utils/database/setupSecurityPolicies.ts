
import { supabase } from '@/integrations/supabase/client';

/**
 * Enables Row Level Security on specific tables
 * and creates appropriate security policies
 */
export const setupSecurityPolicies = async (): Promise<boolean> => {
  try {
    console.log("Setting up security policies for tables...");
    
    // We'll track our progress to return success status
    let success = true;
    
    // Tables that need RLS enabled
    const tablesNeedingRLS = [
      'club_plans',
      'team_plans',
      'user_roles',
      'parent_child_linking',
      'fa_connection_settings',
      'game_formats',
      'performance_categories'
    ];
    
    // Enable RLS on each table
    for (const table of tablesNeedingRLS) {
      const { error: rlsError } = await supabase.rpc(
        'execute_sql', 
        { sql_string: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;` }
      );
      
      if (rlsError) {
        console.error(`Error enabling RLS on ${table}:`, rlsError);
        success = false;
      } else {
        console.log(`Successfully enabled RLS on ${table}`);
      }
    }
    
    // Create read policies for tables (authenticated users can read)
    for (const table of tablesNeedingRLS) {
      const { error: policyError } = await supabase.rpc(
        'execute_sql', 
        { sql_string: `
          CREATE POLICY IF NOT EXISTS "${table}_read_policy" 
          ON public.${table}
          FOR SELECT 
          TO authenticated
          USING (true);
        `}
      );
      
      if (policyError) {
        console.error(`Error creating policy for ${table}:`, policyError);
        success = false;
      } else {
        console.log(`Successfully created read policy for ${table}`);
      }
    }
    
    console.log("Security policies setup completed with status:", success);
    return success;
  } catch (error) {
    console.error("Error setting up security policies:", error);
    return false;
  }
};

/**
 * Alternative approach using direct SQL execution via Edge Functions
 * Use this if RPC method fails
 */
export const setupSecurityPoliciesViaEdgeFunction = async (): Promise<boolean> => {
  try {
    // Call an edge function that would execute these SQL statements
    // This is a fallback if the RPC method isn't available
    const { data, error } = await supabase.functions.invoke('setup-security-policies', {
      body: { 
        tables: [
          'club_plans', 
          'team_plans', 
          'user_roles',
          'parent_child_linking',
          'fa_connection_settings',
          'game_formats',
          'performance_categories'
        ] 
      }
    });
    
    if (error) {
      console.error("Error invoking edge function:", error);
      return false;
    }
    
    return data.success;
  } catch (error) {
    console.error("Error with edge function approach:", error);
    return false;
  }
};

/**
 * Information about SECURITY DEFINER views
 * This is for reference - fixing these requires SQL schema changes
 * that should be done via migrations
 */
export const getSecurityDefinerViewsInfo = (): Array<{name: string, description: string}> => {
  return [
    {
      name: "attribute_history",
      description: "View that shows history of player attribute changes"
    },
    {
      name: "available_players_by_category",
      description: "View that filters players by performance category"
    },
    {
      name: "player_attendance_stats",
      description: "View that shows player attendance statistics"
    },
    {
      name: "player_fixture_stats",
      description: "View that shows player statistics for fixtures"
    },
    {
      name: "player_stats",
      description: "View that shows combined player statistics"
    },
    {
      name: "team_performance_categories",
      description: "View that shows performance categories for teams"
    },
    {
      name: "valid_attendance_status",
      description: "View that validates attendance status values"
    }
  ];
};

