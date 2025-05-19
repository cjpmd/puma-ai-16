
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
    
    // Enable RLS on club_plans
    const { error: clubPlansRlsError } = await supabase.rpc(
      'execute_sql', 
      { sql_string: 'ALTER TABLE public.club_plans ENABLE ROW LEVEL SECURITY;' }
    );
    
    if (clubPlansRlsError) {
      console.error("Error enabling RLS on club_plans:", clubPlansRlsError);
      success = false;
    }
    
    // Enable RLS on team_plans
    const { error: teamPlansRlsError } = await supabase.rpc(
      'execute_sql', 
      { sql_string: 'ALTER TABLE public.team_plans ENABLE ROW LEVEL SECURITY;' }
    );
    
    if (teamPlansRlsError) {
      console.error("Error enabling RLS on team_plans:", teamPlansRlsError);
      success = false;
    }
    
    // Create policies for club_plans (read-only for authenticated users)
    const { error: clubPlansPolicyError } = await supabase.rpc(
      'execute_sql', 
      { sql_string: `
        CREATE POLICY IF NOT EXISTS "club_plans_read_policy" 
        ON public.club_plans
        FOR SELECT 
        TO authenticated
        USING (true);
      `}
    );
    
    if (clubPlansPolicyError) {
      console.error("Error creating policy for club_plans:", clubPlansPolicyError);
      success = false;
    }
    
    // Create policies for team_plans (read-only for authenticated users)
    const { error: teamPlansPolicyError } = await supabase.rpc(
      'execute_sql', 
      { sql_string: `
        CREATE POLICY IF NOT EXISTS "team_plans_read_policy" 
        ON public.team_plans
        FOR SELECT 
        TO authenticated
        USING (true);
      `}
    );
    
    if (teamPlansPolicyError) {
      console.error("Error creating policy for team_plans:", teamPlansPolicyError);
      success = false;
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
      body: { tables: ['club_plans', 'team_plans'] }
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
