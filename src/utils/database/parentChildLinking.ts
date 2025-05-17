
import { columnExists } from "./columnUtils";

/**
 * Set up parent-child linking columns in various tables
 */
export const ensureParentChildLinkingSetup = async (): Promise<boolean> => {
  try {
    console.log("Setting up parent-child linking columns...");
    
    // Check if players table has linking_code column
    const hasLinkingCode = await columnExists('players', 'linking_code');
    if (!hasLinkingCode) {
      console.log("Players table needs linking_code column");
    }
    
    // Check if players table has self_linked column
    const hasSelfLinked = await columnExists('players', 'self_linked');
    if (!hasSelfLinked) {
      console.log("Players table needs self_linked column");
    }
    
    // Check if player_parents table has is_verified column
    const hasIsVerified = await columnExists('player_parents', 'is_verified');
    if (!hasIsVerified) {
      console.log("player_parents table needs is_verified column");
    }
    
    return true;
  } catch (err) {
    console.error("Error in ensureParentChildLinkingSetup:", err);
    return false;
  }
};
