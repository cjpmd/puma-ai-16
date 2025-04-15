
import { tableExists, initializeDatabase } from "./initializeDatabase";

/**
 * Automatically ensures database tables are set up without user interaction
 * This replaces the manual initialization button
 * @returns Promise<boolean> indicating success/failure
 */
export const ensureDatabaseSetup = async (): Promise<boolean> => {
  try {
    console.log("Checking database setup status...");
    
    // Add a timeout to prevent hanging
    const setupPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Check if the clubs table already exists
        const clubsExist = await tableExists('clubs');
        
        // If tables already exist, we're good
        if (clubsExist) {
          console.log("Database tables already exist");
          resolve(true);
          return;
        }
        
        console.log("Setting up database tables automatically...");
        // Automatically initialize the database without user interaction
        const success = await initializeDatabase();
        
        if (success) {
          console.log("Database automatically initialized successfully");
          resolve(true);
        } else {
          console.error("Failed to automatically initialize database");
          
          // Try once more after a short delay (sometimes helps with race conditions)
          await new Promise(resolveTimeout => setTimeout(resolveTimeout, 1000));
          const retrySuccess = await initializeDatabase();
          
          if (retrySuccess) {
            console.log("Database initialized successfully on retry");
            resolve(true);
          } else {
            resolve(false);
          }
        }
      } catch (error) {
        console.error("Error in setup promise:", error);
        resolve(false);
      }
    });
    
    // Set a timeout to prevent hanging forever
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log("Database setup timed out after 8 seconds");
        resolve(false);
      }, 8000);
    });
    
    // Race the setup against the timeout
    return await Promise.race([setupPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error checking/initializing database:", error);
    return false;
  }
};
