
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { executeSql } from "./executeSql";

/**
 * Set up the player transfer system tables
 */
export async function setupTransferSystem(): Promise<boolean> {
  console.log("Setting up transfer system tables...");
  try {
    // Check if player_transfers table exists first
    const { data: existingTable, error: checkError } = await supabase
      .from('player_transfers')
      .select('id')
      .limit(1);
      
    if (!checkError) {
      console.log("Transfer system tables already exist");
      return true;
    }
    
    // Create player_transfers table
    const createTransfersTableQuery = `
      CREATE TABLE IF NOT EXISTS public.player_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID REFERENCES public.players(id) NOT NULL,
        from_team_id UUID REFERENCES public.teams(id),
        to_team_id UUID REFERENCES public.teams(id),
        transfer_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
        status TEXT DEFAULT 'pending',
        reason TEXT,
        type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    // Create RLS policies for the player_transfers table
    const createPoliciesQuery = `
      -- Enable RLS on player_transfers
      ALTER TABLE public.player_transfers ENABLE ROW LEVEL SECURITY;
      
      -- Policy for team admins to read transfers for their teams
      CREATE POLICY IF NOT EXISTS "team_admins_read_transfers" 
        ON public.player_transfers 
        FOR SELECT 
        USING (
          from_team_id IN (SELECT id FROM public.teams WHERE admin_id = auth.uid()) OR
          to_team_id IN (SELECT id FROM public.teams WHERE admin_id = auth.uid()) OR
          player_id IN (SELECT id FROM public.players WHERE team_id IN 
            (SELECT id FROM public.teams WHERE admin_id = auth.uid())
          )
        );
      
      -- Policy for team admins to insert transfers
      CREATE POLICY IF NOT EXISTS "team_admins_insert_transfers" 
        ON public.player_transfers 
        FOR INSERT 
        WITH CHECK (
          player_id IN (SELECT id FROM public.players WHERE team_id IN 
            (SELECT id FROM public.teams WHERE admin_id = auth.uid())
          )
        );
        
      -- Policy for team admins to update transfers
      CREATE POLICY IF NOT EXISTS "team_admins_update_transfers" 
        ON public.player_transfers 
        FOR UPDATE 
        USING (
          to_team_id IN (SELECT id FROM public.teams WHERE admin_id = auth.uid())
        );
    `;
    
    // Ensure players table has status column
    const addStatusColumnQuery = `
      ALTER TABLE public.players ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `;
    
    // Try to execute the creation queries
    let success = false;
    
    // First try using the execute_sql RPC function
    try {
      await supabase.rpc('execute_sql', { sql_string: createTransfersTableQuery });
      await supabase.rpc('execute_sql', { sql_string: createPoliciesQuery });
      await supabase.rpc('execute_sql', { sql_string: addStatusColumnQuery });
      console.log("Transfer system tables and policies created successfully via RPC");
      success = true;
    } catch (rpcError) {
      console.warn("RPC method failed, trying alternative approach:", rpcError);
      
      // If RPC fails, try our custom executeSql function
      try {
        await executeSql(createTransfersTableQuery);
        await executeSql(createPoliciesQuery);
        await executeSql(addStatusColumnQuery);
        console.log("Transfer system tables and policies created successfully via executeSql");
        success = true;
      } catch (sqlError) {
        console.error("Failed to create transfer system tables via executeSql:", sqlError);
      }
    }
    
    // If both methods failed, try to create directly
    if (!success) {
      try {
        // Try direct table creation - simplified approach
        const { error: createError } = await supabase.from('player_transfers').insert({
          player_id: '00000000-0000-0000-0000-000000000000',
          type: 'test',
          status: 'test'
        });
        
        if (createError && createError.code === '42P01') {
          console.error("Failed to create player_transfers table:", createError);
          return false;
        } else {
          // Delete the test record if it was created
          await supabase.from('player_transfers')
            .delete()
            .eq('player_id', '00000000-0000-0000-0000-000000000000');
          
          console.log("Transfer system tables appear to be created via direct approach");
          success = true;
        }
      } catch (directError) {
        console.error("Failed to create transfer system via direct approach:", directError);
      }
    }
    
    return success;
  } catch (error) {
    console.error("Error setting up transfer system:", error);
    return false;
  }
}

/**
 * Verify the player transfer system is properly set up
 */
export async function verifyTransferSystem(): Promise<boolean> {
  try {
    // Check if player_transfers table exists
    const { data, error } = await supabase
      .from('player_transfers')
      .select('id')
      .limit(1);
      
    if (error && error.code === '42P01') {
      console.log("player_transfers table does not exist, setting up transfer system");
      return await setupTransferSystem();
    }
    
    // Check if players table has status column
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('status')
      .limit(1);
      
    if (playerError && playerError.message?.includes('status')) {
      console.log("players table missing status column, adding it");
      // Try to add the status column
      try {
        await supabase.rpc('execute_sql', { 
          sql_string: `ALTER TABLE public.players ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';` 
        });
      } catch (addError) {
        console.warn("Failed to add status column via RPC:", addError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error verifying transfer system:", error);
    return false;
  }
}
