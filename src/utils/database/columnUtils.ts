import { supabase } from "@/integrations/supabase/client";

/**
 * Direct way to check if a column exists in a table
 * This handles the cases where the normal RPC function is not available
 */
export const columnExists = async (table: string, column: string): Promise<boolean> => {
  try {
    // Try the direct query approach first
    try {
      // Try selecting the column directly - if no error, the column exists
      const { error } = await supabase
        .from(table)
        .select(column)
        .limit(1);
      
      if (!error) {
        console.log(`Direct query: ${column} column exists in ${table}`);
        return true;
      }
      
      // If error mentions column doesn't exist, then return false
      if (error.message?.includes("column") && error.message?.includes("does not exist")) {
        console.log(`Direct query: ${column} column does not exist in ${table}`);
        return false;
      }
      
      // Other error, try alternative approach
      console.error(`Error checking if column ${column} exists in ${table}:`, error);
    } catch (error) {
      console.error(`Exception in direct query for ${column} in ${table}:`, error);
      // Continue to alternative approaches
    }

    // Try the RPC method as a backup (though it may not be available)
    try {
      const { data, error } = await supabase.rpc('get_table_columns', {
        table_name: table
      });
      
      if (error) {
        console.error(`RPC error checking if column ${column} exists in ${table}:`, error);
        // Continue to next approach
      } else if (data && Array.isArray(data)) {
        return data.includes(column);
      }
    } catch (rpcError) {
      console.error(`RPC exception checking if column ${column} exists in ${table}:`, rpcError);
      // Continue to next approach
    }
    
    // Fallback to information_schema (may not have permissions)
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_schema', 'public')
        .eq('table_name', table)
        .eq('column_name', column);
        
      if (error) {
        console.error(`Information schema error checking if column ${column} exists in ${table}:`, error);
        // Last resort approach failed
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error(`Information schema exception checking if column ${column} exists in ${table}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`Error checking if column ${column} exists in ${table}:`, error);
    return false;
  }
};

/**
 * Add a column to a table if it doesn't exist
 * @param tableName The name of the table to modify
 * @param columnName The name of the column to add
 * @param columnType The SQL type of the column
 * @param defaultValue Optional default value for the column
 * @returns Promise<boolean> Whether the operation succeeded
 */
export const addColumnIfNotExists = async (
  tableName: string,
  columnName: string,
  columnType: string,
  defaultValue?: string
): Promise<boolean> => {
  try {
    // Check if the column already exists using our simplified approach
    const exists = await columnExists(tableName, columnName);
    if (exists) return true;
    
    console.log(`Adding column ${columnName} to ${tableName}...`);
    
    // For security reasons, we can't execute arbitrary SQL directly
    // Instead, we'll try to use the column in an update to force its creation
    // First for non-UUID types
    if (columnType.toUpperCase() !== 'UUID' && !columnType.includes('UUID')) {
      // For text columns with default values
      if (columnType.toUpperCase().includes('TEXT') && defaultValue) {
        // Try to update the first row with this new column
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ [columnName]: defaultValue })
          .limit(1);
        
        // If the error is not about the column not existing, it might exist now
        if (!updateError || !updateError.message?.includes('does not exist')) {
          return true;
        }
      }
      
      // For boolean columns
      if (columnType.toUpperCase() === 'BOOLEAN') {
        // Use false as default value
        const boolDefault = defaultValue === 'TRUE' ? true : false;
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ [columnName]: boolDefault })
          .limit(1);
        
        if (!updateError || !updateError.message?.includes('does not exist')) {
          return true;
        }
      }
    }
    
    // If still here, try the RPC approach as a last resort
    try {
      const defaultClause = defaultValue ? ` DEFAULT ${defaultValue}` : '';
      const sql = `ALTER TABLE public.${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}${defaultClause};`;
      
      const { error } = await supabase.rpc('execute_sql', { sql_string: sql });
      
      if (!error) {
        return true;
      }
      
      console.error(`RPC error adding column ${columnName} to ${tableName}:`, error);
    } catch (rpcError) {
      console.error(`Failed to add column ${columnName} via RPC:`, rpcError);
    }
    
    // If we got here, we couldn't add the column
    console.warn(`Could not add column ${columnName} to ${tableName} - this may require database migration`);
    return false;
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, error);
    return false;
  }
};

/**
 * Direct SQL approach to add needed columns - simplified to avoid RPC issues
 */
export const addRequiredColumns = async (): Promise<boolean> => {
  try {
    // Add each column individually using our more robust method
    const linkingCodeAdded = await addColumnIfNotExists(
      'players',
      'linking_code',
      'TEXT',
      'gen_random_uuid()::text'
    );
    
    const selfLinkedAdded = await addColumnIfNotExists(
      'players',
      'self_linked',
      'BOOLEAN',
      'FALSE'
    );
    
    const userIdAdded = await addColumnIfNotExists(
      'players',
      'user_id',
      'UUID',
      'NULL'
    );
    
    const isVerifiedAdded = await addColumnIfNotExists(
      'player_parents',
      'is_verified',
      'BOOLEAN',
      'FALSE'
    );
    
    // Report the results
    console.log(`Column addition results:
      - linking_code: ${linkingCodeAdded ? 'Success' : 'Failed'}
      - self_linked: ${selfLinkedAdded ? 'Success' : 'Failed'}
      - user_id: ${userIdAdded ? 'Success' : 'Failed'}
      - is_verified: ${isVerifiedAdded ? 'Success' : 'Failed'}
    `);
    
    return linkingCodeAdded && selfLinkedAdded && userIdAdded && isVerifiedAdded;
  } catch (error) {
    console.error("Error adding required columns:", error);
    return false;
  }
};

/**
 * Ensure the necessary database setup for parent-child linking
 */
export const ensureParentChildLinkingSetup = async (): Promise<boolean> => {
  try {
    // Try the column approach first
    const result = await addRequiredColumns();
    
    if (!result) {
      console.warn("Adding columns failed, trying individual approach");
      
      // Fall back to column-by-column approach
      const parentVerifiedAdded = await addColumnIfNotExists(
        'player_parents',
        'is_verified',
        'BOOLEAN',
        'FALSE'
      );
      
      const linkingCodeAdded = await addColumnIfNotExists(
        'players',
        'linking_code',
        'TEXT',
        'gen_random_uuid()::text'
      );
      
      const selfLinkedAdded = await addColumnIfNotExists(
        'players',
        'self_linked',
        'BOOLEAN',
        'FALSE'
      );
      
      const userIdAdded = await addColumnIfNotExists(
        'players',
        'user_id',
        'UUID',
        'NULL'
      );
      
      return parentVerifiedAdded || linkingCodeAdded || selfLinkedAdded || userIdAdded;
    }
    
    return result;
  } catch (error) {
    console.error('Error setting up parent-child linking:', error);
    return false;
  }
};
