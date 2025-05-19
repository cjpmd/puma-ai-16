
import { supabase } from "@/integrations/supabase/client";
import { tableExists, columnExists } from "./columnUtils";

export const setupTransferSystem = async (): Promise<boolean> => {
  try {
    // First, check if the player_transfers table exists
    let transfersTableExists = await tableExists('player_transfers');
    
    // Create the table if it doesn't exist
    if (!transfersTableExists) {
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
    const statusExists = await columnExists('players', 'status');
    
    if (!statusExists) {
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

// Add the missing approveTransfer function
export const approveTransfer = async (transferId: string): Promise<boolean> => {
  try {
    // First get the transfer details
    const { data: transfer, error: getError } = await supabase
      .from('player_transfers')
      .select('*')
      .eq('id', transferId)
      .single();
    
    if (getError || !transfer) {
      console.error("Error getting transfer details:", getError);
      return false;
    }
    
    // Start a transaction by using supabase functions
    // 1. Update transfer status
    const { error: updateTransferError } = await supabase
      .from('player_transfers')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId);
    
    if (updateTransferError) {
      console.error("Error updating transfer status:", updateTransferError);
      return false;
    }
    
    // 2. Update player's team_id
    const { error: updatePlayerError } = await supabase
      .from('players')
      .update({ 
        team_id: transfer.to_team_id,
        status: 'active',  
        updated_at: new Date().toISOString()
      })
      .eq('id', transfer.player_id);
    
    if (updatePlayerError) {
      console.error("Error updating player team:", updatePlayerError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in approveTransfer:", error);
    return false;
  }
};

// Verify transfer system setup
export const verifyTransferSystem = async (): Promise<boolean> => {
  try {
    const transfersExist = await tableExists('player_transfers');
    const statusExists = await columnExists('players', 'status');
    
    return transfersExist && statusExists;
  } catch (error) {
    console.error("Error verifying transfer system:", error);
    return false;
  }
};
