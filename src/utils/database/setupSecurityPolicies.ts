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

/**
 * Fixes the "Function Search Path Mutable" security warnings by setting
 * explicit search paths for database functions
 */
export const fixFunctionSearchPaths = async (): Promise<boolean> => {
  try {
    console.log("Fixing function search paths for database functions...");
    
    let success = true;
    
    // List of functions with mutable search paths that need fixing
    const functionsToFix = [
      'set_team_category',
      'set_updated_at',
      'table_exists',
      'trigger_calculate_position_suitability',
      'update_attribute_display_order',
      'add_missing_columns_to_fixture_team_selections',
      'create_event_attendance',
      'create_initial_admin',
      'create_table_if_not_exists',
      'execute_sql',
      'function_exists',
      'get_table_columns',
      'handle_new_user',
      'calculate_position_suitability',
      'log_player_category_change',
      'set_default_team_category',
      'update_position_suitability',
      'add_column_if_not_exists',
      'is_club_admin',
      'is_team_admin'
    ];
    
    // Process each function to add search_path
    for (const funcName of functionsToFix) {
      // Get the function definition
      const { data: funcData, error: funcError } = await supabase.rpc(
        'execute_sql', 
        { 
          sql_string: `
            SELECT pg_get_functiondef(oid) AS definition
            FROM pg_proc
            WHERE proname = '${funcName}'
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
          `
        }
      );
      
      if (funcError) {
        console.error(`Error getting function definition for ${funcName}:`, funcError);
        success = false;
        continue;
      }
      
      // No definition found
      if (!funcData || funcData.length === 0) {
        console.warn(`Function ${funcName} not found in database`);
        continue;
      }
      
      // Get the original definition
      const definition = funcData[0]?.definition;
      if (!definition) {
        console.warn(`No definition found for function ${funcName}`);
        continue;
      }
      
      // Check if the definition already has a search_path
      if (definition.toLowerCase().includes('search_path')) {
        console.log(`Function ${funcName} already has a search_path defined, skipping`);
        continue;
      }
      
      // Extract the parts we need
      const matches = definition.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(.*?)\s+RETURNS\s+(.*?)\s+AS\s+(\$\w+\$.*?\$\w+\$)(.*?)LANGUAGE\s+(\w+)/s);
      
      if (!matches || matches.length < 6) {
        console.error(`Could not parse function definition for ${funcName}`);
        success = false;
        continue;
      }
      
      const [, funcSignature, returnType, body, options, language] = matches;
      
      // Create the new function definition with explicit search_path
      const newDefinition = `
        CREATE OR REPLACE FUNCTION ${funcSignature} RETURNS ${returnType} AS ${body}
        SET search_path = 'public'
        LANGUAGE ${language}${options};
      `;
      
      // Apply the update
      const { error: updateError } = await supabase.rpc(
        'execute_sql', 
        { sql_string: newDefinition }
      );
      
      if (updateError) {
        console.error(`Error updating function ${funcName}:`, updateError);
        success = false;
      } else {
        console.log(`Successfully fixed search_path for function ${funcName}`);
      }
    }
    
    console.log("Function search path fixes completed with status:", success);
    return success;
  } catch (error) {
    console.error("Error fixing function search paths:", error);
    return false;
  }
};

/**
 * Fixes materialized view access issues by setting appropriate permissions
 */
export const fixMaterializedViewAccess = async (): Promise<boolean> => {
  try {
    console.log("Fixing materialized view access permissions...");
    
    // List of materialized views that need their permissions adjusted
    const viewsToFix = ['position_rankings'];
    let success = true;
    
    for (const view of viewsToFix) {
      // Revoke access from anon and authenticated roles
      const { error: revokeError } = await supabase.rpc(
        'execute_sql',
        {
          sql_string: `
            REVOKE SELECT ON public.${view} FROM anon;
            REVOKE SELECT ON public.${view} FROM authenticated;
          `
        }
      );
      
      if (revokeError) {
        console.error(`Error revoking permissions for materialized view ${view}:`, revokeError);
        success = false;
      } else {
        console.log(`Successfully restricted access to materialized view ${view}`);
      }
    }
    
    return success;
  } catch (error) {
    console.error("Error fixing materialized view access:", error);
    return false;
  }
};

/**
 * Fixes auth configuration issues
 * Note: Some auth settings may require using the Supabase dashboard directly
 */
export const getAuthConfigurationInfo = (): Array<{name: string, description: string, remediation: string}> => {
  return [
    {
      name: "auth_otp_long_expiry",
      description: "OTP expiry exceeds recommended threshold (should be less than 1 hour)",
      remediation: "Update this in the Supabase dashboard under Authentication > Providers > Email"
    },
    {
      name: "auth_leaked_password_protection",
      description: "Leaked password protection is disabled, increasing security risk",
      remediation: "Enable this in the Supabase dashboard under Authentication > Policies > Password Strength"
    }
  ];
};

/**
 * Optimizes RLS policies by replacing direct auth.uid() calls with (select auth.uid())
 * This fixes the "Auth RLS Initialization Plan" performance warnings
 */
export const optimizeRlsPolicies = async (): Promise<boolean> => {
  try {
    console.log("Optimizing RLS policies to fix auth_rls_initplan warnings...");
    
    // We'll track our progress to return success status
    let success = true;
    
    // First, get a list of policies that need optimization
    const { data: policiesData, error: listError } = await supabase.rpc(
      'execute_sql',
      {
        sql_string: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            cmd,
            permissive,
            roles,
            qual,
            with_check
          FROM 
            pg_policies
          WHERE 
            schemaname = 'public' AND
            (qual::text LIKE '%auth.uid%' OR with_check::text LIKE '%auth.uid%') AND
            (qual::text NOT LIKE '%(select%auth.uid%' AND qual::text NOT LIKE '%(SELECT%auth.uid%')
        `
      }
    );
    
    if (listError) {
      console.error("Error fetching policies that need optimization:", listError);
      return false;
    }

    if (!policiesData || policiesData.length === 0) {
      console.log("No policies found that need optimization");
      return true;
    }
    
    console.log(`Found ${policiesData.length} policies that need optimization`);
    
    // Process each policy
    for (const policy of policiesData) {
      try {
        // First drop the existing policy
        const { error: dropError } = await supabase.rpc(
          'execute_sql',
          {
            sql_string: `
              DROP POLICY IF EXISTS "${policy.policyname}" ON public.${policy.tablename};
            `
          }
        );
        
        if (dropError) {
          console.error(`Error dropping policy ${policy.policyname} on ${policy.tablename}:`, dropError);
          success = false;
          continue;
        }
        
        // Replace auth.uid() with (SELECT auth.uid())
        let optimizedQual = policy.qual;
        let optimizedWithCheck = policy.with_check;
        
        if (optimizedQual) {
          optimizedQual = optimizedQual.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
        }
        
        if (optimizedWithCheck) {
          optimizedWithCheck = optimizedWithCheck.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
        }
        
        // Recreate the policy with optimized conditions
        const cmdMap: Record<string, string> = {
          'r': 'SELECT',
          'a': 'INSERT',
          'w': 'UPDATE',
          'd': 'DELETE',
          '*': 'ALL'
        };
        
        const cmd = cmdMap[policy.cmd] || 'ALL';
        const rolesStr = policy.roles.length > 0 ? `TO ${policy.roles.join(', ')}` : '';
        const usingClause = optimizedQual ? `USING (${optimizedQual})` : '';
        const withCheckClause = optimizedWithCheck ? `WITH CHECK (${optimizedWithCheck})` : '';
        
        const createSql = `
          CREATE POLICY "${policy.policyname}" 
          ON public.${policy.tablename}
          FOR ${cmd}
          ${rolesStr}
          ${usingClause}
          ${withCheckClause};
        `;
        
        const { error: createError } = await supabase.rpc(
          'execute_sql',
          {
            sql_string: createSql
          }
        );
        
        if (createError) {
          console.error(`Error recreating optimized policy ${policy.policyname} on ${policy.tablename}:`, createError);
          success = false;
        } else {
          console.log(`Successfully optimized policy ${policy.policyname} on ${policy.tablename}`);
        }
        
      } catch (policyError) {
        console.error(`Error processing policy ${policy.policyname}:`, policyError);
        success = false;
      }
    }
    
    console.log("RLS policy optimization completed with status:", success);
    return success;
  } catch (error) {
    console.error("Error optimizing RLS policies:", error);
    return false;
  }
};

/**
 * Consolidates multiple permissive policies for the same role and operation
 * This fixes the "Multiple Permissive Policies" performance warnings
 */
export const consolidatePermissivePolicies = async (): Promise<boolean> => {
  try {
    console.log("Consolidating multiple permissive policies...");
    
    // We'll track our progress to return success status
    let success = true;
    
    // First, get a list of tables with multiple permissive policies for the same role and action
    const { data: tablesWithMultiplePolicies, error: listError } = await supabase.rpc(
      'execute_sql',
      {
        sql_string: `
          WITH grouped_policies AS (
            SELECT 
              schemaname, 
              tablename, 
              cmd,
              array_agg(DISTINCT roles[1]) AS roles,
              count(*) AS policy_count
            FROM 
              pg_policies 
            WHERE 
              permissive = 't' AND
              schemaname = 'public'
            GROUP BY 
              schemaname, tablename, roles[1], cmd
            HAVING 
              count(*) > 1
          )
          SELECT DISTINCT 
            tablename
          FROM 
            grouped_policies
          ORDER BY 
            tablename;
        `
      }
    );
    
    if (listError) {
      console.error("Error fetching tables with multiple permissive policies:", listError);
      return false;
    }

    if (!tablesWithMultiplePolicies || tablesWithMultiplePolicies.length === 0) {
      console.log("No tables found with multiple permissive policies");
      return true;
    }
    
    console.log(`Found ${tablesWithMultiplePolicies.length} tables with multiple permissive policies`);
    
    // For each table, we'll consolidate policies for the authenticated role
    for (const tableData of tablesWithMultiplePolicies) {
      const tableName = tableData.tablename;
      
      // For each operation type (SELECT, INSERT, UPDATE, DELETE)
      for (const operation of ['SELECT', 'INSERT', 'UPDATE', 'DELETE']) {
        // Get existing policies for this table, role and operation
        const { data: policies, error: policiesError } = await supabase.rpc(
          'execute_sql',
          {
            sql_string: `
              SELECT 
                policyname,
                qual,
                with_check,
                cmd
              FROM 
                pg_policies 
              WHERE 
                schemaname = 'public' AND
                tablename = '${tableName}' AND
                permissive = 't' AND
                roles[1] = 'authenticated' AND
                (cmd = '${operation.toLowerCase().charAt(0)}' OR cmd = '*')
            `
          }
        );
        
        if (policiesError || !policies || policies.length <= 1) {
          // Skip if error or no multiple policies for this operation
          continue;
        }
        
        console.log(`Found ${policies.length} policies for ${tableName} and operation ${operation}`);
        
        // Extract policy conditions
        const usingConditions = [];
        const withCheckConditions = [];
        
        for (const policy of policies) {
          // Keep track of policy names to drop them later
          if (policy.qual && !usingConditions.includes(policy.qual)) {
            usingConditions.push(policy.qual);
          }
          
          if (policy.with_check && !withCheckConditions.includes(policy.with_check)) {
            withCheckConditions.push(policy.with_check);
          }
          
          // Drop each existing policy
          const { error: dropError } = await supabase.rpc(
            'execute_sql',
            {
              sql_string: `
                DROP POLICY IF EXISTS "${policy.policyname}" ON public.${tableName};
              `
            }
          );
          
          if (dropError) {
            console.error(`Error dropping policy ${policy.policyname} on ${tableName}:`, dropError);
            success = false;
          } else {
            console.log(`Dropped policy ${policy.policyname} on ${tableName}`);
          }
        }
        
        // Create a new consolidated policy
        // If we have multiple conditions, we join them with OR
        const combinedUsing = usingConditions.length > 0 
          ? usingConditions.length > 1 
            ? `(${usingConditions.join(') OR (')})`
            : usingConditions[0]
          : 'true';
          
        const combinedWithCheck = withCheckConditions.length > 0
          ? withCheckConditions.length > 1
            ? `(${withCheckConditions.join(') OR (')})`
            : withCheckConditions[0]
          : 'true';
        
        // Replace auth.uid() with (SELECT auth.uid()) while we're at it
        const optimizedUsing = combinedUsing.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
        const optimizedWithCheck = combinedWithCheck.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
        
        const createSql = `
          CREATE POLICY "consolidated_${tableName}_${operation.toLowerCase()}_policy" 
          ON public.${tableName}
          FOR ${operation}
          TO authenticated
          USING (${optimizedUsing})
          ${operation === 'SELECT' ? '' : `WITH CHECK (${optimizedWithCheck})`};
        `;
        
        const { error: createError } = await supabase.rpc(
          'execute_sql',
          {
            sql_string: createSql
          }
        );
        
        if (createError) {
          console.error(`Error creating consolidated policy for ${tableName} and operation ${operation}:`, createError);
          success = false;
        } else {
          console.log(`Successfully created consolidated policy for ${tableName} and operation ${operation}`);
        }
      }
    }
    
    console.log("Policy consolidation completed with status:", success);
    return success;
  } catch (error) {
    console.error("Error consolidating permissive policies:", error);
    return false;
  }
};

/**
 * Get a count of tables with multiple permissive policies
 * This helps display a count in the UI
 */
export const getPermissivePoliciesCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc(
      'execute_sql',
      {
        sql_string: `
          WITH grouped_policies AS (
            SELECT 
              schemaname, 
              tablename, 
              cmd,
              roles[1] as role,
              count(*) AS policy_count
            FROM 
              pg_policies 
            WHERE 
              permissive = 't' AND
              schemaname = 'public'
            GROUP BY 
              schemaname, tablename, roles[1], cmd
            HAVING 
              count(*) > 1
          )
          SELECT 
            COUNT(*) as count
          FROM 
            grouped_policies;
        `
      }
    );
    
    if (error) {
      console.error("Error fetching multiple permissive policy count:", error);
      return 0;
    }

    return data && data[0]?.count ? parseInt(data[0].count) : 0;
  } catch (error) {
    console.error("Error getting permissive policy count:", error);
    return 0;
  }
};
