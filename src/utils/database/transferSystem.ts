
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
