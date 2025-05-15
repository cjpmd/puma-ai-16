
import { supabase } from "@/integrations/supabase/client";
import { ensureParentChildLinkingSetup } from "./columnUtils";
import { toast } from "sonner";

/**
 * Check if a table exists in the database
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
 * Called at app initialization
 */
export async function ensureDatabaseSetup() {
  console.log("Ensuring database setup...");
  
  try {
    // First, check if critical tables exist
    const profilesExist = await tableExists('profiles');
    const teamsExist = await tableExists('teams');
    
    if (!profilesExist || !teamsExist) {
      console.warn("Critical tables don't exist. Database may not be set up correctly.");
      
      // Show toast notification
      toast.error("Database setup required", {
        description: "Some tables weren't found. Please run the SQL setup scripts in Supabase.",
        duration: 6000,
      });
      
      // Return false but don't block the app from loading
      return false;
    }
    
    // Ensure parent-child linking setup (includes player self-linking columns)
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
