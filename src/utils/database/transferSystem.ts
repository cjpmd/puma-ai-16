
import { supabase } from "@/integrations/supabase/client";
import { createColumnIfNotExists } from "./columnUtils";
import { executeSql } from "./executeSql";

export const setupTransferSystem = async (): Promise<boolean> => {
  try {
    // Check if the table exists first
    const tableExists = await supabase.rpc('table_exists', { 
      table_name: 'player_transfers' 
    });
    
    if (!tableExists) {
      // Create transfers table
      await supabase.rpc('create_table_if_not_exists', {
        p_table_name: 'player_transfers',
        p_columns: `
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id uuid REFERENCES players(id) NOT NULL,
          from_team_id uuid REFERENCES teams(id),
          to_team_id uuid REFERENCES teams(id),
          transfer_date timestamptz DEFAULT now(),
          status text DEFAULT 'pending',
          reason text,
          type text NOT NULL,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        `
      });
      
      console.log('Created player_transfers table successfully');
    } else {
      console.log('player_transfers table already exists');
      
      // Ensure all necessary columns exist
      await createColumnIfNotExists('player_transfers', 'status', 'text');
      await createColumnIfNotExists('player_transfers', 'type', 'text');
      await createColumnIfNotExists('player_transfers', 'reason', 'text');
      await createColumnIfNotExists('player_transfers', 'updated_at', 'timestamptz');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up transfer system:', error);
    return false;
  }
}

export const approveTransfer = async (transferId: string): Promise<boolean> => {
  try {
    // First get the transfer details
    const { data: transfer, error: fetchError } = await supabase
      .from('player_transfers')
      .select('*')
      .eq('id', transferId)
      .single();
      
    if (fetchError) throw fetchError;
    if (!transfer) throw new Error('Transfer not found');
    
    // Begin transaction
    await executeSql('BEGIN;');
    
    try {
      // 1. Update the player's team_id
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({
          team_id: transfer.to_team_id,
          updated_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', transfer.player_id);
        
      if (playerUpdateError) throw playerUpdateError;
      
      // 2. Update transfer status
      const { error: transferUpdateError } = await supabase
        .from('player_transfers')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transferId);
        
      if (transferUpdateError) throw transferUpdateError;
        
      // Commit transaction
      await executeSql('COMMIT;');
      
      return true;
    } catch (error) {
      // Rollback on error
      await executeSql('ROLLBACK;');
      console.error("Error in transaction, rolled back:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in approveTransfer:", error);
    return false;
  }
}
