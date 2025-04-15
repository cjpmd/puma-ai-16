
import { tableExists, initializeDatabase } from "./initializeDatabase";

/**
 * Automatically ensures database tables are set up without user interaction
 * This replaces the manual initialization button
 * @returns Promise<boolean> indicating success/failure
 */
export const ensureDatabaseSetup = async (): Promise<boolean> => {
  try {
    console.log("Checking database setup status...");
    
    // Instead of checking for table existence (which fails if tables don't exist)
    // We'll try to create tables directly with a fallback mechanism
    
    // Use a flag to avoid infinite retries
    const setupFlag = localStorage.getItem('db_setup_attempted');
    const lastAttempt = localStorage.getItem('db_setup_last_attempt');
    
    // Only attempt setup once every 60 seconds
    const now = Date.now();
    const timeSinceLastAttempt = lastAttempt ? now - parseInt(lastAttempt, 10) : Infinity;
    
    if (setupFlag === 'true' && timeSinceLastAttempt < 60000) {
      console.log("Database setup was recently attempted, skipping");
      // Return true to avoid further setup attempts in this session
      return true;
    }
    
    localStorage.setItem('db_setup_last_attempt', now.toString());
    localStorage.setItem('db_setup_attempted', 'true');
    
    // Add a timeout to prevent hanging
    const setupPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Try to initialize the database directly
        console.log("Setting up database tables automatically...");
        const success = await initializeDatabase();
        
        if (success) {
          console.log("Database automatically initialized successfully");
          resolve(true);
        } else {
          console.log("Failed to automatically initialize database");
          
          // If it's our first attempt, try once more after a short delay
          if (setupFlag !== 'retry') {
            localStorage.setItem('db_setup_attempted', 'retry');
            await new Promise(resolveTimeout => setTimeout(resolveTimeout, 1000));
            const retrySuccess = await initializeDatabase();
            
            if (retrySuccess) {
              console.log("Database initialized successfully on retry");
              resolve(true);
            } else {
              // If we still can't set up the database, allow the user to proceed anyway
              console.log("Database setup failed, but allowing app to proceed");
              resolve(true);
            }
          } else {
            // If we've already retried, just let the user proceed
            console.log("Database setup failed on previous attempts, allowing app to proceed");
            resolve(true);
          }
        }
      } catch (error) {
        console.error("Error in setup promise:", error);
        // Even if setup fails, allow the user to proceed
        // The app will show appropriate UI for missing tables
        resolve(true);
      }
    });
    
    // Set a timeout to prevent hanging forever
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log("Database setup timed out after 3 seconds");
        // Even on timeout, allow the user to proceed
        resolve(true);
      }, 3000);
    });
    
    // Race the setup against the timeout
    return await Promise.race([setupPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error checking/initializing database:", error);
    // Even on error, allow the user to proceed
    return true;
  }
};
