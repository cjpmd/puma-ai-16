
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { columnExists, tableExists, createColumnIfNotExists } from "./columnUtils";

/**
 * Verify if the transfer system tables and columns exist
 */
export const verifyTransferSystem = async (): Promise<boolean> => {
  try {
    // Check if the player_transfers table exists
    const hasTransfersTable = await tableExists('player_transfers');
    
    // Check if players table has status column
    const hasStatusColumn = await columnExists('players', 'status');
    
    // Check if players table has linking_code column
    const hasLinkingCodeColumn = await columnExists('players', 'linking_code');
    
    console.log({
      hasTransfersTable,
      hasStatusColumn,
      hasLinkingCodeColumn
    });
    
    return hasTransfersTable && hasStatusColumn && hasLinkingCodeColumn;
  } catch (error) {
    console.error("Error verifying transfer system:", error);
    return false;
  }
};

/**
 * Set up the transfer system tables and columns
 */
export const setupTransferSystem = async (): Promise<boolean> => {
  try {
    // Check if the system is already set up
    const isSetUp = await verifyTransferSystem();
    
    if (isSetUp) {
      console.log("Transfer system is already set up");
      return true;
    }
    
    let success = true;
    
    // Create player_transfers table if it doesn't exist
    const hasTransfersTable = await tableExists('player_transfers');
    if (!hasTransfersTable) {
      console.log("Creating player_transfers table");
      
      // Create the player_transfers table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.player_transfers (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          player_id uuid REFERENCES players(id) NOT NULL,
          from_team_id uuid REFERENCES teams(id),
          to_team_id uuid REFERENCES teams(id),
          transfer_date timestamp with time zone DEFAULT now(),
          status text DEFAULT 'pending',
          reason text,
          type text NOT NULL,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );
      `;
      
      try {
        const { error } = await supabase.rpc('execute_sql', { sql_string: createTableSQL });
        if (error) {
          console.error("Failed to create player_transfers table:", error);
          success = false;
        } else {
          console.log("Successfully created player_transfers table");
        }
      } catch (tableError) {
        console.error("Failed to create player_transfers table:", tableError);
        success = false;
      }
    }
    
    // Add status column to players if it doesn't exist
    const hasStatusColumn = await columnExists('players', 'status');
    if (!hasStatusColumn) {
      console.log("Adding status column to players table");
      
      const statusAdded = await createColumnIfNotExists(
        'players', 
        'status', 
        'text DEFAULT \'active\''
      );
      
      if (!statusAdded) {
        console.error("Failed to add status column to players table");
        success = false;
      }
    }
    
    // Add linking_code column to players if it doesn't exist
    const hasLinkingCodeColumn = await columnExists('players', 'linking_code');
    if (!hasLinkingCodeColumn) {
      console.log("Adding linking_code column to players table");
      
      const linkingCodeAdded = await createColumnIfNotExists(
        'players', 
        'linking_code', 
        'text'
      );
      
      if (!linkingCodeAdded) {
        console.error("Failed to add linking_code column to players table");
        success = false;
      }
    }
    
    // Return overall success
    if (success) {
      console.log("Transfer system setup completed successfully");
    }
    
    return success;
  } catch (error) {
    console.error("Error setting up transfer system:", error);
    return false;
  }
};

/**
 * Generate a linking code for a player
 */
export const generatePlayerLinkingCode = async (playerId: string): Promise<string | null> => {
  try {
    // First, verify that the linking_code column exists
    const hasLinkingCodeColumn = await columnExists('players', 'linking_code');
    
    if (!hasLinkingCodeColumn) {
      console.log("linking_code column doesn't exist, adding it now");
      const created = await createColumnIfNotExists('players', 'linking_code', 'text');
      if (!created) {
        console.error("Failed to create linking_code column");
        return null;
      }
    }
    
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save the code to the player record
    const { error } = await supabase
      .from('players')
      .update({ linking_code: code })
      .eq('id', playerId);
      
    if (error) {
      console.error("Error saving linking code:", error);
      return null;
    }
    
    return code;
  } catch (error) {
    console.error("Error generating linking code:", error);
    return null;
  }
};

/**
 * Approve a transfer
 */
export const approveTransfer = async (transferId: string): Promise<boolean> => {
  try {
    // Get the transfer details
    const { data: transfer, error: transferError } = await supabase
      .from('player_transfers')
      .select('*')
      .eq('id', transferId)
      .single();
    
    if (transferError || !transfer) {
      throw transferError || new Error("Transfer not found");
    }
    
    // Update the player's team_id
    const { error: playerError } = await supabase
      .from('players')
      .update({ 
        team_id: transfer.to_team_id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', transfer.player_id);
    
    if (playerError) throw playerError;
    
    // Update the transfer status
    const { error: updateError } = await supabase
      .from('player_transfers')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transferId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error("Error approving transfer:", error);
    toast.error("Failed to approve transfer");
    return false;
  }
};
