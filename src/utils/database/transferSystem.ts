
import { supabase } from '@/integrations/supabase/client';
import { tableExists } from './columnUtils';

/**
 * Set up the necessary database tables for the transfer system
 * @returns Promise<boolean> True if setup was successful
 */
export const setupTransferSystem = async (): Promise<boolean> => {
  try {
    // First, check if the player_transfers table exists
    const transfersTableExists = await tableExists('player_transfers');
    
    if (!transfersTableExists) {
      // Create the player_transfers table
      const { error: createTableError } = await supabase.rpc('create_table_if_not_exists', {
        p_table_name: 'player_transfers',
        p_columns: `
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id UUID NOT NULL REFERENCES players(id),
          from_team_id UUID REFERENCES teams(id),
          to_team_id UUID REFERENCES teams(id),
          transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'pending',
          reason TEXT,
          type TEXT NOT NULL
        `
      });
      
      if (createTableError) {
        console.error('Error creating player_transfers table:', createTableError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up transfer system:', error);
    return false;
  }
};

/**
 * Approves a player transfer request
 * @param transferId The ID of the transfer to approve
 * @returns Promise<boolean> True if the transfer was approved successfully
 */
export const approveTransfer = async (transferId: string): Promise<boolean> => {
  try {
    // First, get the transfer details
    const { data: transfer, error: getError } = await supabase
      .from('player_transfers')
      .select('*')
      .eq('id', transferId)
      .single();
    
    if (getError || !transfer) {
      console.error('Error getting transfer:', getError);
      return false;
    }
    
    // Update the transfer status to 'approved'
    const { error: updateError } = await supabase
      .from('player_transfers')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId);
    
    if (updateError) {
      console.error('Error updating transfer status:', updateError);
      return false;
    }
    
    // If it's a transfer (not just a leave), update the player's team_id
    if (transfer.type === 'transfer' && transfer.to_team_id) {
      const { error: playerUpdateError } = await supabase
        .from('players')
        .update({ 
          team_id: transfer.to_team_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', transfer.player_id);
      
      if (playerUpdateError) {
        console.error('Error updating player team:', playerUpdateError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error approving transfer:', error);
    return false;
  }
};
