
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

/**
 * Gets the content of SQL files to execute in the database
 * @param path Path to the SQL file
 * @returns SQL content as string
 */
export const getSqlContent = async (path: string): Promise<string> => {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load SQL file: ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading SQL file ${path}:`, error);
    throw error;
  }
};

/**
 * Execute SQL on the Supabase database
 * @param sql SQL string to execute
 * @returns Result of the SQL execution
 */
export const executeSql = async (sql: string) => {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_string: sql });
    
    if (error) {
      console.error("Error executing SQL:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error executing SQL:", error);
    return { success: false, error };
  }
};

/**
 * Checks if a table exists in the database
 * @param tableName Name of the table to check
 * @returns Boolean indicating if the table exists
 */
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('count(*)', { count: 'exact', head: true });
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

/**
 * Initialize the database tables using the SQL files
 */
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // Check if clubs table already exists
    const clubsExist = await tableExists('clubs');
    if (clubsExist) {
      console.log("Database tables already exist");
      return true;
    }
    
    // Get the SQL content
    const sql = await getSqlContent('/sql/create_multi_team_club_structure.sql');
    
    // Execute the SQL
    const result = await executeSql(sql);
    
    if (result.success) {
      console.log("Database tables created successfully");
      toast({
        title: "Database Initialized",
        description: "Application database tables have been created successfully",
      });
      return true;
    } else {
      console.error("Failed to create database tables:", result.error);
      toast({
        title: "Database Error",
        description: "Failed to create database tables. See console for details.",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    toast({
      title: "Database Error",
      description: "Failed to initialize the database. See console for details.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Button to initialize the database
 */
export const InitializeDatabaseButton = () => {
  const handleInitialize = async () => {
    try {
      toast({
        title: "Initializing Database",
        description: "Please wait while we set up the database...",
      });
      
      const success = await initializeDatabase();
      
      if (success) {
        toast({
          title: "Success",
          description: "Database initialized successfully. You can now create clubs and teams.",
        });
        // Reload the page to reflect the new database state
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize database. Please check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please check console for details.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Button 
      onClick={handleInitialize}
      className="flex items-center gap-2"
      variant="default"
    >
      <Database className="h-4 w-4" />
      Initialize Database
    </Button>
  );
};
