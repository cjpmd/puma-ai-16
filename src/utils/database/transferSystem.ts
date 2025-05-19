
import { supabase } from "@/integrations/supabase/client";

export const setupTransferSystem = async (): Promise<boolean> => {
  try {
    // First, check if the player_transfers table exists
    let tableExists = false;
    
    try {
      // Using execute_sql to run a check
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_string: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'player_transfers'
          ) as table_exists;
        `
      });
      
      if (!error && data && data[0]?.table_exists) {
        console.log("player_transfers table already exists");
        tableExists = true;
      }
    } catch (checkError) {
      console.error("Error checking if player_transfers table exists:", checkError);
      
      // Fallback method - try querying the table directly
      try {
        const { error } = await supabase
          .from('player_transfers')
          .select('id')
          .limit(1);
          
        // If no error, table exists
        if (!error) {
          tableExists = true;
          console.log("Verified player_transfers table exists via direct query");
        }
      } catch (fallbackError) {
        console.error("Error in fallback check for player_transfers:", fallbackError);
      }
    }
    
    // Create the table if it doesn't exist
    if (!tableExists) {
      try {
        console.log("Attempting to create player_transfers table");
        
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.player_transfers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            player_id uuid REFERENCES public.players(id) NOT NULL,
            from_team_id uuid REFERENCES public.teams(id),
            to_team_id uuid REFERENCES public.teams(id),
            transfer_date timestamp with time zone DEFAULT now(),
            status text DEFAULT 'pending',
            reason text,
            type text NOT NULL,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
          );
        `;
        
        const { error } = await supabase.rpc('execute_sql', { 
          sql_string: createTableSQL 
        });
        
        if (error) {
          console.error("Error creating player_transfers table via execute_sql:", error);
          return false;
        }
        
        console.log("Successfully created player_transfers table");
        return true;
      } catch (createError) {
        console.error("Exception creating player_transfers table:", createError);
        return false;
      }
    }
    
    // If we get here, the table already exists
    return true;
  } catch (error) {
    console.error("Error in setupTransferSystem:", error);
    return false;
  }
};

// Add status field to players table if it doesn't exist
export const addPlayerStatusColumn = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: `
        ALTER TABLE public.players
        ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
      `
    });
    
    if (error) {
      console.error("Error adding status column to players:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in addPlayerStatusColumn:", error);
    return false;
  }
};

// Create a new player transfer request
export const createTransferRequest = async (
  playerId: string,
  fromTeamId: string | null,
  toTeamId: string | null,
  reason: string,
  type: 'transfer' | 'leave'
): Promise<boolean> => {
  try {
    const transferData = {
      player_id: playerId,
      from_team_id: fromTeamId,
      to_team_id: toTeamId,
      reason,
      type,
      status: type === 'transfer' ? 'pending' : 'completed',
      transfer_date: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('player_transfers')
      .insert(transferData);
      
    if (error) {
      console.error("Error creating transfer request:", error);
      return false;
    }
    
    // If player is leaving, update their status directly
    if (type === 'leave') {
      const { error: updateError } = await supabase
        .from('players')
        .update({ 
          team_id: null,
          status: 'inactive'
        })
        .eq('id', playerId);
        
      if (updateError) {
        console.error("Error updating player status:", updateError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Exception in createTransferRequest:", error);
    return false;
  }
};

// Get pending transfers for a team
export const getPendingTransfers = async (teamId: string) => {
  try {
    const { data, error } = await supabase
      .from('player_transfers')
      .select(`
        *,
        player:player_id(*),
        from_team:from_team_id(*),
        to_team:to_team_id(*)
      `)
      .eq('to_team_id', teamId)
      .eq('status', 'pending');
      
    if (error) {
      console.error("Error getting pending transfers:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception in getPendingTransfers:", error);
    return [];
  }
};
