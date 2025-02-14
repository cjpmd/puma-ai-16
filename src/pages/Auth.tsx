
import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, check if we have an invalid session
        const { error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (sessionError.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
          }
          throw sessionError;
        }

        // Then check if we're already signed in
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!mounted) return;

        if (userError) {
          if (userError.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
          }
          throw userError;
        }

        if (user) {
          navigate("/home");
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
        navigate("/home");
      } else if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <img 
            src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" 
            alt="Broughty United Pumas Logo" 
            className="h-32 w-auto mx-auto"
          />
          <div>
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};
