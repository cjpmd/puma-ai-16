
import { supabase } from '@/integrations/supabase/client';
import { customAlphabet } from 'nanoid';
import { tableExists } from './columnUtils';
import { createPlayerParentsTable } from './createTables';

// Create a nanoid generator for linking codes
const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// Generate child linking code
export const generateChildLinkingCode = (): string => {
  return nanoid();
};

/**
 * Link a parent to a child using player_id and parent user_id
 */
export const linkParentToChild = async (
  playerId: string, 
  parentId: string
): Promise<boolean> => {
  try {
    // Make sure the parent_child_linking table exists
    const exists = await tableExists('parent_child_linking');
    if (!exists) {
      const { error: createError } = await supabase.rpc('create_table_if_not_exists', {
        p_table_name: 'parent_child_linking',
        p_columns: `
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          parent_id UUID REFERENCES auth.users(id),
          player_id UUID REFERENCES players(id),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        `
      });
      
      if (createError) {
        console.error('Error creating parent_child_linking table:', createError);
        return false;
      }
    }
    
    // Insert the new linking record
    const { error } = await supabase
      .from('parent_child_linking')
      .insert({
        parent_id: parentId,
        player_id: playerId
      });
    
    if (error) {
      console.error('Error linking parent to child:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in linkParentToChild:', error);
    return false;
  }
};

/**
 * Create player_parents table if it doesn't exist - for backward compatibility 
 */
export const createPlayerParentsTableCompat = async (): Promise<boolean> => {
  // Delegate to the function in createTables.ts
  return createPlayerParentsTable();
};
