
import { supabase } from "@/integrations/supabase/client";
import { ensureParentChildLinkingSetup } from "./columnUtils";

/**
 * Ensure all required database tables and columns exist
 * Called at app initialization
 */
export async function ensureDatabaseSetup() {
  console.log("Ensuring database setup...");
  
  try {
    // Ensure parent-child linking setup (includes player self-linking columns)
    const parentChildLinkingSetup = await ensureParentChildLinkingSetup();
    if (!parentChildLinkingSetup) {
      console.warn("Failed to set up parent-child linking columns");
    }
    
    // Call other setup functions as needed
    
    console.log("Database setup completed");
    return true;
  } catch (err) {
    console.error("Error in database setup:", err);
    return false;
  }
}
