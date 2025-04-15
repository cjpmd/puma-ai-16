
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Plus, Users, Trophy, Calendar, CheckCircle, LogIn, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ensureDatabaseSetup } from "@/utils/database/ensureDatabaseSetup";

export default function Index() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState(false);
  const [setupInProgress, setSetupInProgress] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setLoading(false);
          return;
        }
        
        setSession(data.session);
        
        // Attempt to automatically set up database tables
        if (data.session) {
          setSetupInProgress(true);
          const dbSetup = await ensureDatabaseSetup();
          setDatabaseError(!dbSetup);
          setSetupInProgress(false);
          
          try {
            let teamData = null;
            let clubData = null;
            
            try {
              const { data: teamResult, error: teamError } = await supabase
                .from('teams')
                .select('id, team_name, team_logo')
                .eq('admin_id', data.session.user.id)
                .maybeSingle();
              
              if (teamError) {
                if (teamError.code === '42P01') {
                  console.log("Team query failed - table may not exist yet:", teamError);
                  // We'll try to auto-setup instead of showing an error
                  ensureDatabaseSetup();
                } else {
                  console.error("Error querying teams:", teamError);
                }
              } else {
                teamData = teamResult;
              }
            } catch (err) {
              console.log("Error querying teams:", err);
            }
            
            try {
              const { data: clubResult, error: clubError } = await supabase
                .from('clubs')
                .select('id')
                .eq('admin_id', data.session.user.id)
                .maybeSingle();
              
              if (clubError) {
                if (clubError.code === '42P01') {
                  console.log("Club query failed - table may not exist yet:", clubError);
                  // We'll try to auto-setup instead of showing an error
                  ensureDatabaseSetup();
                } else {
                  console.error("Error querying clubs:", clubError);
                }
              } else {
                clubData = clubResult;
              }
            } catch (err) {
              console.log("Error querying clubs:", err);
            }
            
            if (teamData) {
              if (teamData.team_logo) {
                localStorage.setItem('team_logo', teamData.team_logo);
              }
              localStorage.setItem('team_name', teamData.team_name || 'My Team');
              
              navigate("/home");
              return;
            } else if (clubData) {
              navigate("/club-settings");
              return;
            }
          } catch (error) {
            console.error("Error checking user entities:", error);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Try to ensure database is set up
          setSetupInProgress(true);
          const dbSetup = await ensureDatabaseSetup();
          setDatabaseError(!dbSetup);
          setSetupInProgress(false);
          
          try {
            let teamData = null;
            let clubData = null;
            
            try {
              const { data: teamResult, error: teamError } = await supabase
                .from('teams')
                .select('id, team_name, team_logo')
                .eq('admin_id', session.user.id)
                .maybeSingle();
              
              if (teamError) {
                if (teamError.code === '42P01') {
                  console.log("Team query failed - table may not exist yet:", teamError);
                  ensureDatabaseSetup();
                } else {
                  console.error("Error querying teams:", teamError);
                }
              } else {
                teamData = teamResult;
              }
            } catch (err) {
              console.log("Error querying teams:", err);
            }
            
            try {
              const { data: clubResult, error: clubError } = await supabase
                .from('clubs')
                .select('id')
                .eq('admin_id', session.user.id)
                .maybeSingle();
              
              if (clubError) {
                if (clubError.code === '42P01') {
                  console.log("Club query failed - table may not exist yet:", clubError);
                  ensureDatabaseSetup();
                } else {
                  console.error("Error querying clubs:", clubError);
                }
              } else {
                clubData = clubResult;
              }
            } catch (err) {
              console.log("Error querying clubs:", err);
            }
            
            if (teamData) {
              if (teamData.team_logo) {
                localStorage.setItem('team_logo', teamData.team_logo);
              }
              localStorage.setItem('team_name', teamData.team_name || 'My Team');
              
              toast({
                title: "Welcome back!",
                description: `You've been signed in to ${teamData.team_name}`,
              });
              
              navigate("/home");
            } else if (clubData) {
              navigate("/club-settings");
            } else {
              navigate("/platform");
            }
          } catch (error) {
            console.error("Error checking user entities:", error);
            navigate("/platform");
          }
        } else {
          setLoading(false);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout reached, forcing loading state to false");
        setLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(loadingTimeout);
  }, [loading]);

  if (loading || setupInProgress) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png" 
            alt="Puma.AI Logo" 
            className="h-32 w-auto mx-auto mb-6" 
          />
          <h1 className="text-4xl font-bold mb-4">Puma.AI Team Management Platform</h1>
          <div className="flex justify-center">
            <Skeleton className="h-6 w-64" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <img 
          src="/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png" 
          alt="Puma.AI Logo" 
          className="h-32 w-auto mx-auto mb-6" 
        />
        <h1 className="text-4xl font-bold mb-4">Puma.AI Team Management Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive tools for sports teams and clubs to manage players, fixtures, and performance.
        </p>
        
        {databaseError && (
          <Alert variant="destructive" className="mt-4 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Configuration</AlertTitle>
            <AlertDescription>
              <p className="mb-2">The system is currently being configured. Please try again later.</p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-center mt-8">
          {session ? (
            <Button size="lg" onClick={() => navigate("/platform")}>
              Go to My Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate("/auth")}>
              Sign In
              <LogIn className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Create a Team
            </CardTitle>
            <CardDescription>
              Set up your team to start managing players and fixtures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                Create your own team to:
              </div>
              <ul className="space-y-2">
                {[
                  "Manage your squad roster",
                  "Schedule fixtures and training",
                  "Track player performance",
                  "Generate team selections",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => {
                if (session) {
                  navigate("/create-team");
                } else {
                  navigate("/auth", { state: { returnTo: "/create-team" } });
                }
              }}
            >
              {session ? "Create Your Team" : "Sign In to Create"}
              {session ? <Plus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Create a Club
            </CardTitle>
            <CardDescription>
              Set up a club to connect multiple teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                Create a club to:
              </div>
              <ul className="space-y-2">
                {[
                  "Connect multiple teams under one organization",
                  "Track club-wide player statistics",
                  "Monitor training and playing minutes",
                  "Generate club-level reports",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => {
                if (session) {
                  navigate("/club-settings");
                } else {
                  navigate("/auth", { state: { returnTo: "/club-settings" } });
                }
              }}
            >
              {session ? "Create Your Club" : "Sign In to Create"}
              {session ? <Plus className="ml-2 h-4 w-4" /> : <LogIn className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Team Management",
              icon: <Trophy className="h-10 w-10 text-primary" />,
              description: "Create and manage your team roster, track player performance, and organize fixtures and training sessions."
            },
            {
              title: "Club Administration",
              icon: <Users className="h-10 w-10 text-primary" />,
              description: "Connect multiple teams under one club, track club-wide statistics, and monitor overall performance."
            },
            {
              title: "Subscription Management",
              icon: <CheckCircle className="h-10 w-10 text-primary" />,
              description: "Track player subscriptions, manage payments, and generate financial reports for your team or club."
            }
          ].map((feature, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
