
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Verify if the transfer system tables and columns exist
 */
export const verifyTransferSystem = async (): Promise<boolean> => {
  try {
    // Check if the player_transfers table exists
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'player_transfers')
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return true;
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
    // Check if the player_transfers table exists
    const tableExists = await verifyTransferSystem();
    
    if (tableExists) {
      console.log("Transfer system is already set up");
      return true;
    }
    
    // Create the player_transfers table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.player_transfers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    
    // Try to use execute_sql RPC function if available
    try {
      await supabase.rpc('execute_sql', { sql_string: createTableSQL });
      console.log("Successfully created player_transfers table");
      return true;
    } catch (rpcError) {
      console.error("Failed to create player_transfers table via RPC:", rpcError);
      // Graceful fallback for UI
      return false;
    }
  } catch (error) {
    console.error("Error setting up transfer system:", error);
    return false;
  }
};

/**
 * Add status column to players table if it doesn't exist
 */
export const addStatusColumnToPlayers = async (): Promise<boolean> => {
  try {
    // First check if column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'players')
      .eq('column_name', 'status');
    
    if (columnsError) throw columnsError;
    
    // If column already exists, return true
    if (columns && columns.length > 0) {
      console.log("Status column already exists in players table");
      return true;
    }
    
    // Try to add column using RPC
    const addColumnSQL = `
      ALTER TABLE public.players
      ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
    `;
    
    try {
      await supabase.rpc('execute_sql', { sql_string: addColumnSQL });
      console.log("Successfully added status column to players table");
      return true;
    } catch (rpcError) {
      console.error("Failed to add status column via RPC:", rpcError);
      // Graceful fallback for UI
      return false;
    }
  } catch (error) {
    console.error("Error adding status column to players table:", error);
    return false;
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
