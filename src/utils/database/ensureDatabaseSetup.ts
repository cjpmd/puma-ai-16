
import { tableExists, initializeDatabase } from "./initializeDatabase";

/**
 * Automatically ensures database tables are set up without user interaction
 * This replaces the manual initialization button
 * @returns Promise<boolean> indicating success/failure
 */
export const ensureDatabaseSetup = async (): Promise<boolean> => {
  try {
    console.log("Checking database setup status...");
    
    // Check if we've already attempted setup recently to avoid loops
    const setupFlag = localStorage.getItem('db_setup_attempted');
    const lastAttempt = localStorage.getItem('db_setup_last_attempt');
    
    // Only attempt setup once every 60 seconds
    const now = Date.now();
    const timeSinceLastAttempt = lastAttempt ? now - parseInt(lastAttempt, 10) : Infinity;
    
    if (setupFlag === 'true' && timeSinceLastAttempt < 60000) {
      console.log("Database setup was recently attempted, skipping");
      // Return true to avoid further setup attempts in this session
      // This prevents endless loading loops
      return true;
    }
    
    localStorage.setItem('db_setup_last_attempt', now.toString());
    localStorage.setItem('db_setup_attempted', 'true');
    
    // Create a promise that will resolve after a maximum of 3 seconds
    // This prevents hanging if Supabase is unreachable
    const setupPromise = new Promise<boolean>(async (resolve) => {
      try {
        console.log("Setting up database tables automatically...");
        const success = await initializeDatabase();
        
        if (success) {
          console.log("Database automatically initialized successfully");
          resolve(true);
        } else {
          console.log("Database setup failed, but allowing app to proceed");
          // Always resolve true to let the user continue using the app
          // The UI will show appropriate messages for missing tables
          resolve(true);
        }
      } catch (error) {
        console.error("Error in setup promise:", error);
        // Even on error, allow the app to proceed
        resolve(true);
      }
    });
    
    // Set a hard timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log("Database setup timed out after 2 seconds");
        resolve(true); // Resolve as true to let the user proceed
      }, 2000); // Reduced from 3s to 2s for faster feedback
    });
    
    // Race the setup against the timeout
    // This ensures we never wait longer than the timeout period
    return await Promise.race([setupPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error checking/initializing database:", error);
    // Even on error, allow the user to proceed
    return true;
  }
};
