
import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [authUiError, setAuthUiError] = useState<string | null>(null);

  // Get the return path from location state, default to platform dashboard
  const returnTo = location.state?.returnTo || "/platform";

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log("Auth: Starting initialization");
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error("Auth: Session error", sessionError);
          if (sessionError.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
          }
          throw sessionError;
        }

        if (session) {
          console.log("Auth: Found existing session", session);
          try {
            // Check if user has a team
            const { data: teamData, error: teamError } = await supabase
              .from('teams')
              .select('id, team_name, team_logo')
              .eq('admin_id', session.user.id)
              .maybeSingle();
              
            if (teamError) {
              console.error("Auth: Team lookup error", teamError);
            }
              
            // Check if user has a club  
            const { data: clubData, error: clubError } = await supabase
              .from('clubs')
              .select('id')
              .eq('admin_id', session.user.id)
              .maybeSingle();
              
            if (clubError) {
              console.error("Auth: Club lookup error", clubError);
            }
              
            if (teamData) {
              console.log("Auth: Found team, redirecting to home");
              // Store team data in localStorage
              if (teamData.team_logo) {
                localStorage.setItem('team_logo', teamData.team_logo);
              }
              localStorage.setItem('team_name', teamData.team_name || 'My Team');
              
              // Redirect to team dashboard
              navigate("/home");
              return;
            } else if (clubData) {
              console.log("Auth: Found club, redirecting to club settings");
              // Redirect to club dashboard
              navigate("/club-settings");
              return;
            } else {
              console.log("Auth: No team or club, redirecting to platform");
              // No team or club yet, go to platform landing
              navigate(returnTo);
              return;
            }
          } catch (error) {
            console.error("Error checking user entities:", error);
            navigate(returnTo);
            return;
          }
        } else {
          console.log("Auth: No existing session found");
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Auth initialization error:", err);
        if (err instanceof Error) {
          setErrorMessage(getErrorMessage(err as AuthError));
        } else {
          setErrorMessage("An error occurred while checking your session.");
        }
      } finally {
        if (mounted) {
          console.log("Auth: Initialization complete, showing auth UI");
          setIsLoading(false);
        }
      }
    };
    
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        setErrorMessage("");
        
        try {
          // Check if user has a team
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('id, team_name, team_logo')
            .eq('admin_id', session.user.id)
            .maybeSingle();
            
          if (teamError) {
            console.error("Auth: Team lookup error after sign-in", teamError);
          }
            
          // Check if user has a club  
          const { data: clubData, error: clubError } = await supabase
            .from('clubs')
            .select('id')
            .eq('admin_id', session.user.id)
            .maybeSingle();
            
          if (clubError) {
            console.error("Auth: Club lookup error after sign-in", clubError);
          }
            
          if (teamData) {
            console.log("Auth: Found team after sign-in, redirecting to home");
            // Store team data in localStorage
            if (teamData.team_logo) {
              localStorage.setItem('team_logo', teamData.team_logo);
            }
            localStorage.setItem('team_name', teamData.team_name || 'My Team');
            
            // Redirect to team dashboard
            navigate("/home");
          } else if (clubData) {
            console.log("Auth: Found club after sign-in, redirecting to club settings");
            // Redirect to club dashboard
            navigate("/club-settings");
          } else {
            console.log("Auth: No team or club after sign-in, redirecting to platform");
            // No team or club yet, go to platform landing or returnTo path
            navigate(returnTo);
          }
        } catch (error) {
          console.error("Error checking user entities:", error);
          navigate(returnTo);
        }
      } else if (event === "SIGNED_OUT") {
        setErrorMessage("");
        // Clear team data from localStorage
        localStorage.removeItem('team_logo');
        localStorage.removeItem('team_name');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, returnTo]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("refresh_token_not_found")) {
            return "Your session has expired. Please sign in again.";
          }
          return "Invalid credentials. Please check your email and password.";
        case 401:
          return "You are not authorized. Please sign in again.";
        case 403:
          return "Access forbidden. Please check your credentials.";
        case 404:
          return "User not found. Please check your credentials.";
        case 422:
          return "Invalid input. Please check your credentials.";
        case 429:
          return "Too many requests. Please try again later.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  // If there's an error with the Supabase auth UI
  const handleAuthUiError = () => {
    setAuthUiError("Failed to load authentication interface. Please try refreshing the page.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <img 
            src="/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png" 
            alt="Puma.AI Logo" 
            className="h-32 w-auto mx-auto"
          />
          <div>
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue to Puma.AI</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {authUiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authUiError}</AlertDescription>
            </Alert>
          )}

          <div id="auth-container">
            {!authUiError && (
              <SupabaseAuth 
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                theme="light"
                providers={[]}
                onError={(error) => {
                  console.error("Supabase Auth UI error:", error);
                  handleAuthUiError();
                }}
              />
            )}
          </div>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Sign in to access your team</p>
          </div>
        </div>
      </div>
    </div>
  );
};
