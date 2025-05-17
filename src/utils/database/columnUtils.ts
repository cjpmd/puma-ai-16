
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a column exists in a table
 * @param tableName The name of the table
 * @param columnName The name of the column
 * @returns boolean indicating if the column exists
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Try to select the column directly - if it doesn't exist, it will error
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    // If there's no error, the column exists
    if (!error) {
      return true;
    }
    
    // Check if the error indicates the column doesn't exist
    if (error.message.includes(`column "${columnName}" does not exist`)) {
      return false;
    }
    
    // For any other error, log it and assume the column doesn't exist
    console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
    return false;
  } catch (err) {
    console.error(`Exception checking if column ${columnName} exists in table ${tableName}:`, err);
    return false;
  }
};

/**
 * Check if a table exists in the database
 * @param tableName The name of the table
 * @returns boolean indicating if the table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Try to query the table - if it doesn't exist, it will error
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // If there's no error, the table exists
    // Note: there could be permission errors, but those would be different
    if (!error) {
      return true;
    }
    
    // Check if the error indicates the relation doesn't exist
    if (error.message.includes(`relation "${tableName}" does not exist`)) {
      return false;
    }
    
    // For any other error, log it and assume the table doesn't exist
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  } catch (err) {
    console.error(`Exception checking if table ${tableName} exists:`, err);
    return false;
  }
};

/**
 * Create a table if it doesn't exist
 * Unfortunately Supabase doesn't allow `CREATE TABLE IF NOT EXISTS` through the client
 * but we can check if the table exists first
 */
export const createTableIfNotExists = async (tableName: string, createTableSQL: string): Promise<boolean> => {
  try {
    // Check if table exists
    const exists = await tableExists(tableName);
    if (exists) {
      return true;
    }

    // Table doesn't exist, try to create it - note this would require proper permissions
    // and typically should be done through migrations rather than client code
    console.log(`Table ${tableName} doesn't exist. Would need migration to create it.`);
    return false;
  } catch (err) {
    console.error(`Error in createTableIfNotExists for ${tableName}:`, err);
    return false;
  }
};

/**
 * Add a column to a table if it doesn't exist
 * Unfortunately Supabase doesn't allow `ALTER TABLE ADD COLUMN IF NOT EXISTS` through the client
 * but we can check if the column exists first
 */
export const addColumnIfNotExists = async (
  tableName: string, 
  columnName: string,
  columnDef: string
): Promise<boolean> => {
  try {
    // Check if column exists
    const exists = await columnExists(tableName, columnName);
    if (exists) {
      return true;
    }

    // Column doesn't exist, would need to add it - typically through migrations
    console.log(`Column ${columnName} doesn't exist in ${tableName}. Would need migration to add it.`);
    return false;
  } catch (err) {
    console.error(`Error in addColumnIfNotExists for ${tableName}.${columnName}:`, err);
    return false;
  }
};

/**
 * Export database utility functions from original columnUtils if they exist
 */
export { ensureParentChildLinkingSetup } from "./columnUtils";
