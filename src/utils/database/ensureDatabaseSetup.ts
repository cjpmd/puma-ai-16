
import { supabase } from "@/integrations/supabase/client";
import { ensureParentChildLinkingSetup } from "./parentChildLinking";
import { toast } from "sonner";
import { initializeDatabase } from "./initializeDatabase";
import { tableExists } from "./columnUtils";
import { verifyTransferSystem } from "./transferSystem";

/**
 * Ensure all required database tables and columns exist
 * Called at app initialization with improved error handling
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
      'team_settings',
      'player_transfers'
    ];
    
    // Instead of trying to create tables that don't exist, we'll just check if they exist
    // and if not, we'll assume tables need to be created through SQL migrations
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
      
      try {
        // Try to initialize the database with a timeout to prevent hanging
        const initPromise = initializeDatabase();
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => {
            console.log("Database setup check timed out");
            resolve(false);
          }, 10000); // 10 second timeout
        });
        
        // Race the initialization against the timeout
        const initResult = await Promise.race([initPromise, timeoutPromise]);
        
        if (!initResult) {
          toast.message("Database Setup Note", {
            description: "Some database tables could not be verified. App functionality may be limited.",
            duration: 8000,
          });
        }
        
        // Return result without additional toasts
        return true;
      } catch (err) {
        console.error("Error in database initialization:", err);
        toast.error("Database Setup Issue", {
          description: "Could not set up required database tables. Some features may not work correctly.",
          duration: 8000,
        });
        return false;
      }
    }
    
    // Ensure parent-child linking setup
    try {
      const parentChildLinkingSetup = await ensureParentChildLinkingSetup();
      if (!parentChildLinkingSetup) {
        console.warn("Failed to set up parent-child linking columns");
      }
    } catch (err) {
      console.warn("Error checking parent-child linking setup:", err);
    }
    
    // Verify transfer system is properly set up
    try {
      const transferSystemSetup = await verifyTransferSystem();
      if (!transferSystemSetup) {
        console.warn("Failed to verify transfer system setup");
      }
    } catch (err) {
      console.warn("Error checking transfer system setup:", err);
    }
    
    console.log("Database setup verified successfully");
    return true;
  } catch (err) {
    console.error("Error in database setup:", err);
    
    toast.error("Database setup issue", {
      description: "There was a problem checking database tables. Some features may be limited.",
      duration: 6000,
    });
    
    // Return true anyway to allow the app to continue loading with limited functionality
    return true;
  }
}
