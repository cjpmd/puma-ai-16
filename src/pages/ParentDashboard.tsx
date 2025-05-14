
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { ParentSubscriptionManager } from "@/components/parents/ParentSubscriptionManager";

// Define proper types for the Supabase response
interface PlayerTeam {
  id: string;
  team_name: string;
  age_group: string | null;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  team_id: string;
  teams?: PlayerTeam;
}

interface PlayerParent {
  player_id: string;
  players: Player;
}

interface FormattedPlayer extends Player {
  team?: PlayerTeam;
}

export function ParentDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [linkedPlayers, setLinkedPlayers] = useState<FormattedPlayer[]>([]);

  useEffect(() => {
    const fetchLinkedPlayers = async () => {
      if (!profile) return;
      
      setLoading(true);
      try {
        // Fetch players that are linked to the current user as a parent
        const { data, error } = await supabase
          .from('player_parents')
          .select(`
            player_id,
            players (
              id,
              first_name,
              last_name,
              team_id,
              teams (
                id,
                team_name,
                age_group
              )
            )
          `)
          .eq('parent_id', profile.id);
        
        if (error) throw error;
        
        // Format the data for easier consumption
        const formattedPlayers = data.map((item: PlayerParent) => {
          return {
            ...item.players,
            team: item.players?.teams
          };
        });
        
        setLinkedPlayers(formattedPlayers);
      } catch (error) {
        console.error("Error fetching linked players:", error);
        toast({
          title: "Error",
          description: "Failed to load your linked players",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLinkedPlayers();
  }, [profile]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Parent Dashboard</h1>
        <Button variant="outline" asChild>
          <Link to="/calendar">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="players">
        <TabsList className="mb-6">
          <TabsTrigger value="players" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>My Players</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="players">
          {loading ? (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground">Loading your players...</p>
            </div>
          ) : linkedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {linkedPlayers.map((player) => (
                <Card key={player.id}>
                  <CardHeader>
                    <CardTitle>{player.first_name} {player.last_name}</CardTitle>
                    <CardDescription>
                      {player.team?.team_name} {player.team?.age_group && `(${player.team.age_group})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Next fixture: Check calendar</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to={`/player/${player.id}`}>View Player Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Players Linked</CardTitle>
                <CardDescription>
                  You don't have any players linked to your parent account yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Please contact your team administrator to link players to your account.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage subscriptions for all your linked players
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkedPlayers.length > 0 ? (
                <div className="space-y-6">
                  {linkedPlayers.map(player => (
                    <div key={player.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <h3 className="text-lg font-medium mb-4">{player.first_name} {player.last_name}</h3>
                      <ParentSubscriptionManager playerId={player.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No players linked to your account to manage subscriptions for.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
