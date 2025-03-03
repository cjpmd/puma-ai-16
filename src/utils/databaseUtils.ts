
import { supabase } from "@/integrations/supabase/client";

/**
 * Direct SQL execution for critical database operations
 */
export const executeSql = async (sql: string): Promise<boolean> => {
  try {
    console.log(`Executing SQL: ${sql}`);
    const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });
    
    if (error) {
      console.error(`SQL execution error:`, error);
      return false;
    }
    
    console.log(`SQL execution result:`, data);
    return true;
  } catch (error) {
    console.error(`Exception during SQL execution:`, error);
    return false;
  }
};

/**
 * Enhanced column existence check with proper error handling and detailed logging
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    console.log(`Checking if column ${columnName} exists in ${tableName}...`);
    
    // Manual approach - directly query the information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) {
      console.error(`Error querying information schema:`, error);
      
      // Fallback approach - try to select the column
      const { error: selectError } = await supabase
        .from(tableName)
        .select(columnName)
        .limit(1);
      
      const exists = !selectError;
      console.log(`Column ${columnName} exists in ${tableName} (query check): ${exists}`);
      
      if (selectError) {
        console.error(`Error checking column existence: ${selectError.message}`);
      }
      
      return exists;
    }
    
    const exists = data && data.length > 0;
    console.log(`Column ${columnName} exists in ${tableName} (schema check): ${exists}`);
    return exists;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Gets a list of columns for a table with enhanced error handling
 */
export const getTableColumns = async (tableName: string): Promise<string[]> => {
  try {
    console.log(`Getting columns for ${tableName}...`);
    
    // Direct query to information_schema
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`Error querying information schema:`, error);
      
      // Fallback: Try querying one row to get the structure
      const { data: rowData, error: rowError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (rowError) {
        console.error(`Error getting columns for ${tableName}:`, rowError);
        return [];
      }
      
      // If data exists, get the keys from the first row
      if (rowData && rowData.length > 0) {
        const columns = Object.keys(rowData[0]);
        console.log(`Retrieved columns for ${tableName} from row:`, columns);
        return columns;
      }
      
      console.log(`No data found for ${tableName} to determine columns`);
      return [];
    }
    
    const columns = data.map(col => col.column_name);
    console.log(`Retrieved columns for ${tableName}:`, columns);
    return columns;
  } catch (error) {
    console.error(`Failed to get columns for ${tableName}:`, error);
    return [];
  }
};

/**
 * Manual column creation via direct SQL
 */
export const createColumn = async (
  tableName: string,
  columnName: string,
  columnType: string
): Promise<boolean> => {
  try {
    console.log(`Creating column ${columnName} in ${tableName} with type ${columnType}`);
    
    // Prevent SQL injection by validating inputs
    if (!/^[a-z0-9_]+$/.test(tableName) || !/^[a-z0-9_]+$/.test(columnName) || 
        !['text', 'integer', 'boolean', 'float', 'json', 'jsonb', 'timestamp'].includes(columnType)) {
      console.error('Invalid table name, column name, or column type');
      return false;
    }
    
    // Use direct SQL to create the column
    const sql = `ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnType}`;
    return await executeSql(sql);
  } catch (error) {
    console.error(`Failed to create column ${columnName} in ${tableName}:`, error);
    return false;
  }
};

/**
 * Ensures a column exists in a table with improved logging and error handling
 */
export const ensureColumnExists = async (
  tableName: string, 
  columnName: string,
  columnType: string = 'text'
): Promise<boolean> => {
  try {
    console.log(`Ensuring column ${columnName} exists in ${tableName}...`);
    
    // Try checking if column exists first
    const exists = await columnExists(tableName, columnName);
    console.log(`Column check result for ${columnName} in ${tableName}: ${exists}`);
    
    if (!exists) {
      console.log(`Column ${columnName} not found in ${tableName}, attempting to create it...`);
      const created = await createColumn(tableName, columnName, columnType);
      console.log(`Column ${columnName} creation result: ${created}`);
      return created;
    }
    
    return exists;
  } catch (error) {
    console.error(`Error ensuring column ${columnName} exists in ${tableName}:`, error);
    return false;
  }
};

/**
 * Directly checks if a table has a specific value in a column for a specific record
 * Useful for verifying if data was saved correctly
 */
export const verifyDataSaved = async (
  tableName: string,
  columnName: string,
  recordId: string,
  expectedValue: any
): Promise<boolean> => {
  try {
    console.log(`Verifying data saved in ${tableName}.${columnName} for record ${recordId}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', recordId)
      .single();
    
    if (error) {
      console.error(`Error verifying saved data: ${error.message}`);
      return false;
    }
    
    const saved = data && data[columnName] === expectedValue;
    console.log(`Data verification result: ${saved}`, data);
    return saved;
  } catch (error) {
    console.error(`Error verifying data save:`, error);
    return false;
  }
};

/**
 * Add column if not exists (client-side implementation)
 */
export const addColumnIfNotExists = async (
  tableName: string, 
  columnName: string, 
  columnType: string
): Promise<boolean> => {
  try {
    console.log(`Adding column ${columnName} to ${tableName}...`);
    
    // First check if it exists
    const exists = await columnExists(tableName, columnName);
    if (exists) {
      console.log(`Column ${columnName} already exists in ${tableName}`);
      return true;
    }
    
    // Create the column using our direct SQL approach
    return await createColumn(tableName, columnName, columnType);
  } catch (error) {
    console.error(`Error in addColumnIfNotExists:`, error);
    return false;
  }
};
