import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthError, AuthResponse, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountLinkingOptions } from "@/components/auth/AccountLinkingOptions";
import { RoleManager } from "@/components/auth/RoleManager";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ensureDatabaseSetup } from "@/utils/database/ensureDatabaseSetup";

export function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [dbCheckComplete, setDbCheckComplete] = useState(false);
  const [dbSetupError, setDbSetupError] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Check if the user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) navigate("/platform");
    });

    // Set up a listener for changes to auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) navigate("/platform");
      }
    );

    // Check database setup
    checkDatabaseSetup();

    return () => {
      subscription.unsubscribe();
    }
  }, [navigate]);

  const checkDatabaseSetup = async () => {
    try {
      // Set a timeout to prevent hanging on database check
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => {
          console.warn("Database setup check timed out");
          resolve(false);
        }, 5000); // 5 second timeout
      });
      
      // Actual check
      const checkPromise = ensureDatabaseSetup()
        .then(result => {
          setDbSetupError(!result);
          return result;
        })
        .catch(error => {
          console.error("Error checking database setup:", error);
          setDbSetupError(true);
          return false;
        });
      
      // Use Promise.race to handle timeout
      await Promise.race([checkPromise, timeoutPromise]);
    } finally {
      // Always mark check as complete, even if it errored or timed out
      setDbCheckComplete(true);
    }
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignInError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setSignInError(error.message);
        console.error("Sign in error:", error.message);
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setSignInError(error.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "An unexpected error occurred during sign in.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setSignUpError(null);
    setCreating(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        setSignUpError(error.message);
        console.error("Sign up error:", error.message);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your sign up.",
        });
        setIsSignUp(false); // Switch back to sign in tab
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      setSignUpError(error.message || "An unexpected error occurred.");
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "An unexpected error occurred during sign up.",
      });
    } finally {
      setCreating(false);
    }
  };

  // If we're still checking the database setup and don't have a session yet, show a loading state
  if (!dbCheckComplete && !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Initializing System</CardTitle>
            <CardDescription className="text-center">
              Checking database configuration...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has a session, show role manager or redirect
  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md w-full space-y-4 p-4">
          <AccountLinkingOptions />
          <RoleManager />
        </div>
      </div>
    );
  }

  // Otherwise show sign in / sign up form
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Team Manager</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" value={isSignUp ? "signup" : "signin"}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>Sign In</TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {signInError && (
                  <p className="text-sm text-destructive">{signInError}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {signUpError && (
                  <p className="text-sm text-destructive">{signUpError}</p>
                )}
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {dbSetupError && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700">
                Note: Database setup is incomplete. Some features may not work correctly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
