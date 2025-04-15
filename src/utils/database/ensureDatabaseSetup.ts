
import { tableExists, initializeDatabase } from "./initializeDatabase";

/**
 * Automatically ensures database tables are set up without user interaction
 * This replaces the manual initialization button
 * @returns Promise<boolean> indicating success/failure
 */
export const ensureDatabaseSetup = async (): Promise<boolean> => {
  try {
    // Check if the clubs table already exists
    const clubsExist = await tableExists('clubs');
    
    // If tables already exist, we're good
    if (clubsExist) {
      console.log("Database tables already exist");
      return true;
    }
    
    console.log("Setting up database tables automatically...");
    // Automatically initialize the database without user interaction
    const success = await initializeDatabase();
    
    if (success) {
      console.log("Database automatically initialized successfully");
      return true;
    } else {
      console.error("Failed to automatically initialize database");
      return false;
    }
  } catch (error) {
    console.error("Error checking/initializing database:", error);
    return false;
  }
};
