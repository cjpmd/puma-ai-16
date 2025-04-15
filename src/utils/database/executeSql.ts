
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct SQL execution for critical database operations
 * Fallback to direct table operations when RPC is not available
 */
export const executeSql = async (sql: string): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    console.log(`Attempting SQL execution: ${sql}`);
    
    // Try to determine the operation type from the SQL statement
    const isAlterTable = sql.toUpperCase().includes('ALTER TABLE');
    const tableName = isAlterTable ? sql.match(/ALTER TABLE\s+(\w+)/i)?.[1] : null;
    const isAddColumn = isAlterTable && sql.toUpperCase().includes('ADD COLUMN');
    const columnName = isAddColumn ? sql.match(/ADD COLUMN\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] : null;
    
    if (isAlterTable && tableName && isAddColumn && columnName) {
      // This is an ALTER TABLE ADD COLUMN operation - we can try a direct approach
      console.log(`Detected column addition for ${tableName}.${columnName}, using direct method`);
      
      // For the specific case of adding profile_image to players
      if (tableName === 'players' && columnName === 'profile_image') {
        const success = await addProfileImageColumn();
        return { success };
      }
      
      // For other columns - since we can't execute arbitrary SQL, 
      // we'll have to implement specific cases as needed
      console.log(`No direct implementation for adding ${columnName} to ${tableName}`);
    }
    
    // Fallback to RPC (even though we know it probably won't work, for future compatibility)
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });
      
      if (error) {
        console.error(`SQL RPC execution error:`, error);
        return { success: false, error };
      }
      
      console.log(`SQL RPC execution result:`, data);
      return { success: true, data };
    } catch (rpcError) {
      console.error(`RPC method failed, using fallback approaches:`, rpcError);
      return { success: false, error: rpcError };
    }
  } catch (error) {
    console.error(`Exception during SQL execution:`, error);
    return { success: false, error };
  }
};

/**
 * Direct method to add profile_image column to players table
 * Uses a combination of updates to bypass SQL execution
 */
async function addProfileImageColumn(): Promise<boolean> {
  try {
    console.log("Adding profile_image column to players table using direct approach");
    
    // First, try to update a player with the profile_image field
    // If it succeeds, the column already exists
    const testPlayerId = await getFirstPlayerId();
    
    if (testPlayerId) {
      console.log(`Testing update on player ${testPlayerId} to check if column exists`);
      const { error: updateError } = await supabase
        .from('players')
        .update({ profile_image: null })
        .eq('id', testPlayerId);
      
      if (!updateError) {
        console.log("Column already exists - update succeeded");
        return true;
      }
      
      // If the error is specifically about the column not existing
      if (updateError.message?.includes('profile_image') && 
          (updateError.message?.includes('does not exist') || 
           updateError.message?.includes('column "profile_image" of relation "players" does not exist'))) {
        console.log("Column doesn't exist yet - error confirms it");
      } else {
        console.error("Unexpected error testing column:", updateError);
        // Continue anyway - we'll try to add it
      }
    }
    
    // Since we can't run ALTER TABLE directly, we need a workaround
    // We'll use a different approach to signal that we've recognized the column
    
    // Ideally, we would use a migration tool here
    console.log("Column needs to be added, but cannot be performed through the client");
    console.log("Please add the column through a migration or the Supabase UI");
    
    // For now, return false to indicate we couldn't add the column
    return false;
  } catch (error) {
    console.error("Error in addProfileImageColumn:", error);
    return false;
  }
}

/**
 * Helper to get first player ID for testing column existence
 */
async function getFirstPlayerId(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('id')
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.error("Error getting player for column test:", error);
      return null;
    }
    
    return data[0].id;
  } catch (error) {
    console.error("Error in getFirstPlayerId:", error);
    return null;
  }
}
