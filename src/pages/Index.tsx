
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initializeDatabase } from "@/utils/database/initializeDatabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ensureDatabaseSetup } from "@/utils/database/ensureDatabaseSetup";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlatformLanding } from "./PlatformLanding";

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRunning, setSetupRunning] = useState(false);
  const [dbSetupError, setDbSetupError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Set up a listener for changes to auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    // Check database setup status
    checkDatabaseSetup();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkDatabaseSetup = async () => {
    try {
      const result = await ensureDatabaseSetup();
      setDbSetupError(!result);
    } catch (error) {
      console.error("Error checking database setup:", error);
      setDbSetupError(true);
    }
  };

  const handleDatabaseSetup = async () => {
    setSetupRunning(true);
    toast({
      description: "Starting database setup...",
    });
    
    try {
      const result = await initializeDatabase();
      if (result) {
        toast({
          title: "Success",
          description: "Database setup completed successfully.",
        });
        // Recheck database setup
        await checkDatabaseSetup();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Database setup failed. Please check console for details.",
        });
      }
    } catch (error) {
      console.error("Error in database setup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during database setup.",
      });
    } finally {
      setSetupRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If user is logged in, show the platform landing page
  if (session) {
    return <PlatformLanding />;
  }

  // If not logged in, show the welcome screen
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Team Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage your team, fixtures, and players</p>
        </div>

        {dbSetupError && (
          <Alert variant="destructive">
            <AlertTitle>Database Setup Required</AlertTitle>
            <AlertDescription>
              <p>Your database is not properly set up. This may cause features to not work correctly.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={handleDatabaseSetup}
                disabled={setupRunning}
              >
                {setupRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Set Up Database"
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Log in to access your team dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content for the welcome card */}
            <p className="text-center text-sm text-muted-foreground">
              Manage your team's squad, fixtures, and analytics in one place
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/auth")} size="lg" className="w-full">
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
