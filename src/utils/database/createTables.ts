
import { supabase } from '@/integrations/supabase/client';
import { customAlphabet } from 'nanoid';
import { columnExists } from './columnUtils';

// Create a nanoid generator for linking codes
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// Generate linking code for players
export const generateLinkingCode = (): string => {
  return nanoid();
};

/**
 * Create player_parents table if it doesn't exist
 */
export const createPlayerParentsTable = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      p_table_name: 'player_parents',
      p_columns: `
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player_id UUID REFERENCES players(id),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      `
    });

    if (error) {
      console.error('Error creating player_parents table:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createPlayerParentsTable:', error);
    return false;
  }
};
