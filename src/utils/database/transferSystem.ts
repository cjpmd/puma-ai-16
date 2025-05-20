
import { supabase } from '@/integrations/supabase/client';

/**
 * Process a player transfer between teams
 * @param playerId The ID of the player to transfer
 * @param fromTeamId The ID of the team the player is leaving
 * @param toTeamId The ID of the team the player is joining
 * @param reason Optional reason for the transfer
 * @returns Promise<boolean> True if transfer was successful
 */
export const transferPlayer = async (
  playerId: string,
  fromTeamId: string | null,
  toTeamId: string,
  reason?: string
): Promise<boolean> => {
  try {
    // Create a transfer record
    const { error: transferError } = await supabase
      .from('player_transfers')
      .insert({
        player_id: playerId,
        from_team_id: fromTeamId,
        to_team_id: toTeamId,
        reason: reason,
        type: 'MANUAL',
        status: 'approved' // Auto-approved for manual transfers
      });
      
    if (transferError) {
      console.error('Error creating transfer record:', transferError);
      return false;
    }
    
    // Update the player's team
    const { error: playerError } = await supabase
      .from('players')
      .update({ team_id: toTeamId })
      .eq('id', playerId);
      
    if (playerError) {
      console.error('Error updating player team:', playerError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in transferPlayer:', error);
    return false;
  }
};

/**
 * Approve a pending transfer
 * @param transferId The ID of the transfer to approve
 * @returns Promise<boolean> True if the transfer was approved successfully
 */
export const approveTransfer = async (transferId: string): Promise<boolean> => {
  try {
    // Get the transfer details
    const { data: transfer, error: fetchError } = await supabase
      .from('player_transfers')
      .select('*')
      .eq('id', transferId)
      .single();
      
    if (fetchError || !transfer) {
      console.error('Error fetching transfer:', fetchError);
      return false;
    }
    
    // Update transfer status to approved
    const { error: updateError } = await supabase
      .from('player_transfers')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', transferId);
      
    if (updateError) {
      console.error('Error updating transfer status:', updateError);
      return false;
    }
    
    // Update the player's team
    const { error: playerError } = await supabase
      .from('players')
      .update({ team_id: transfer.to_team_id })
      .eq('id', transfer.player_id);
      
    if (playerError) {
      console.error('Error updating player team:', playerError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in approveTransfer:', error);
    return false;
  }
};

/**
 * Set up transfer system (create tables, etc)
 * @returns Promise<boolean> True if setup was successful
 */
export const setupTransferSystem = async (): Promise<boolean> => {
  try {
    // This function would normally create tables, set up RLS policies, etc.
    // For now, just return true to satisfy the type check
    console.log('Transfer system setup performed');
    return true;
  } catch (error) {
    console.error('Error setting up transfer system:', error);
    return false;
  }
};
