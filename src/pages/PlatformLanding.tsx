
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Plus, Users, Trophy, Calendar, CheckCircle } from "lucide-react";

export default function PlatformLanding() {
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userClub, setUserClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    
    const fetchUserEntities = async () => {
      setLoading(true);
      try {
        // Check if user has a team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (teamError) throw teamError;
        
        if (teamData) {
          setUserTeam(teamData);
        }
        
        // Check if user has a club
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (clubError) throw clubError;
        
        if (clubData) {
          setUserClub(clubData);
        }
      } catch (error) {
        console.error("Error fetching user entities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEntities();
  }, [profile]);

  const renderUserOptions = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your options...</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userTeam ? (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Your Team
              </CardTitle>
              <CardDescription>
                Continue managing your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium text-xl">{userTeam.team_name}</div>
                <div className="text-sm text-muted-foreground">{userTeam.age_group}</div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Squad Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Fixture Planning</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/home")}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
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
              <Button className="w-full" onClick={() => navigate("/create-team")}>
                Create Your Team
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {userClub ? (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Your Club
              </CardTitle>
              <CardDescription>
                Manage your club and connected teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="font-medium text-xl">{userClub.name}</div>
                <div className="text-sm text-muted-foreground">{userClub.location}</div>
                
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Club Administration</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Club Serial Number:</span>
                    <span className="ml-2 font-mono text-xs">{userClub.serial_number}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/club-settings")}>
                Manage Club
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
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
              <Button className="w-full" onClick={() => navigate("/club-settings")}>
                Create Your Club
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  };

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
      </div>
      
      {renderUserOptions()}
      
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
