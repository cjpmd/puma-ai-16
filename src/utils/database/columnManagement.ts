
import { executeSql } from "./executeSql";
import { columnExists } from "./columnUtils";

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
    const result = await executeSql(sql);
    
    // Return a boolean based on the result of executeSql
    return result.success;
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
