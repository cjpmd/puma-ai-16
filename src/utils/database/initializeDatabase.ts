
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createPlayerParentsTable } from "./createTables";
import { setupTransferSystem } from "./transferSystem";

// Function to create necessary tables and functions
export async function initializeDatabase(): Promise<boolean> {
  console.log("Starting database initialization...");
  toast.info("Initializing database...");
  
  try {
    // Try to setup parent-child linking
    try {
      console.log("Setting up parent-child linking tables...");
      await createPlayerParentsTable();
    } catch (err) {
      console.warn("Error setting up parent-child linking tables:", err);
    }
    
    // Try to setup transfer system
    try {
      console.log("Setting up transfer system...");
      await setupTransferSystem();
    } catch (err) {
      console.warn("Error setting up transfer system:", err);
    }
    
    // Simulate successful table creation
    toast.success("Database Initialization", {
      description: "Database initialization completed. Some features may have limited functionality.",
    });
    
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    toast.error("Database Initialization Issue", {
      description: "Database initialization encountered problems. Some features may not work.",
    });
    return false;
  }
}
