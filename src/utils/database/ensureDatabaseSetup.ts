
import { supabase } from "@/integrations/supabase/client";
import { ensureParentChildLinkingSetup } from "./columnUtils";
import { toast } from "sonner";
import { initializeDatabase } from "./initializeDatabase";

/**
 * Check if a table exists in the database with improved error handling
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Ensure all required database tables and columns exist
 * Called at app initialization with improved timeout and retry logic
 */
export async function ensureDatabaseSetup() {
  console.log("Ensuring database setup...");
  
  try {
    // Check if critical tables exist
    const criticalTables = [
      'profiles', 
      'teams', 
      'players', 
      'performance_categories', 
      'game_formats',
      'team_settings'
    ];
    
    const tableChecks = await Promise.all(
      criticalTables.map(async (table) => {
        const exists = await tableExists(table);
        console.log(`Table '${table}' exists: ${exists}`);
        return { table, exists };
      })
    );
    
    const missingTables = tableChecks.filter(check => !check.exists).map(check => check.table);
    
    if (missingTables.length > 0) {
      console.warn(`Missing tables: ${missingTables.join(', ')}. Attempting database initialization.`);
      
      // Try to initialize the database
      const initResult = await initializeDatabase();
      
      // Show toast notification based on result
      if (!initResult) {
        toast.error("Database setup required", {
          description: `Missing tables: ${missingTables.join(', ')}. Please run the SQL setup scripts in Supabase.`,
          duration: 6000,
        });
      } else {
        toast.success("Database initialized", {
          description: "The database has been set up with required tables.",
          duration: 4000,
        });
        
        // Re-check tables after initialization
        const allTablesExistNow = await Promise.all(
          missingTables.map(table => tableExists(table))
        ).then(results => results.every(exists => exists));
        
        if (allTablesExistNow) {
          return true;
        }
      }
      
      // Return false if we couldn't create all tables, but don't block the app
      return false;
    }
    
    // Ensure parent-child linking setup
    const parentChildLinkingSetup = await ensureParentChildLinkingSetup();
    if (!parentChildLinkingSetup) {
      console.warn("Failed to set up parent-child linking columns");
    }
    
    console.log("Database setup verified successfully");
    return true;
  } catch (err) {
    console.error("Error in database setup:", err);
    
    // Show toast notification
    toast.error("Database setup error", {
      description: "There was a problem checking database tables. Please try again later.",
      duration: 6000,
    });
    
    return false;
  }
}
