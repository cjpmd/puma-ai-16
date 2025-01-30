import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

export const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Clear any existing session data on mount
    const clearInvalidSession = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error clearing session:", error);
      }
    };

    // Check for existing valid session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes("refresh_token_not_found")) {
            await clearInvalidSession();
            setErrorMessage("Your session has expired. Please sign in again.");
          } else {
            setErrorMessage(getErrorMessage(error));
          }
          return;
        }

        if (session?.user) {
          navigate("/home");
        }
      } catch (err) {
        console.error("Session check error:", err);
        setErrorMessage("An error occurred while checking your session.");
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN" && session) {
        navigate("/home");
      } else if (event === "TOKEN_REFRESHED" && session) {
        navigate("/home");
      } else if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => {
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