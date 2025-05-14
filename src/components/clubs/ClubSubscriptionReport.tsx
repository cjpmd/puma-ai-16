
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClubSubscriptionReport() {
  const [teams, setTeams] = useState<any[]>([]);
  const [subscriptionSummary, setSubscriptionSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile) return;

    const fetchClubData = async () => {
      setLoading(true);
      try {
        // First fetch the club managed by the current user
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('id, name')
          .eq('admin_id', profile.id)
          .single();

        if (clubError) throw new Error("No club found or you don't have permission");

        // Then fetch all teams in this club
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, team_name')
          .eq('club_id', clubData.id);

        if (teamsError) throw teamsError;

        setTeams(teamsData || []);

        // For each team, fetch subscription data
        const subscriptionData = await Promise.all(
          teamsData.map(async (team) => {
            // Get player count for this team
            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('id')
              .eq('team_id', team.id);

            if (playersError) {
              console.error(`Error fetching players for team ${team.team_name}:`, playersError);
              return {
                team_id: team.id,
                team_name: team.team_name,
                total_players: 0,
                active_subscriptions: 0,
                paused_subscriptions: 0,
                total_monthly_revenue: 0,
                players_with_subscriptions: []
              };
            }

            // Get subscription data for this team
            const { data: subscriptionsData, error: subscriptionsError } = await supabase
              .from('players')
              .select(`
                id,
                name,
                player_subscriptions (
                  id,
                  status,
                  subscription_amount
                )
              `)
              .eq('team_id', team.id);

            if (subscriptionsError) {
              console.error(`Error fetching subscriptions for team ${team.team_name}:`, subscriptionsError);
              return {
                team_id: team.id,
                team_name: team.team_name,
                total_players: playersData?.length || 0,
                active_subscriptions: 0,
                paused_subscriptions: 0,
                total_monthly_revenue: 0,
                players_with_subscriptions: []
              };
            }

            // Calculate subscription statistics
            const playersWithSubscriptions = subscriptionsData.filter(
              player => player.player_subscriptions?.length > 0
            );
            
            const activeSubscriptions = playersWithSubscriptions.filter(
              player => player.player_subscriptions?.[0]?.status === 'active'
            );
            
            const pausedSubscriptions = playersWithSubscriptions.filter(
              player => player.player_subscriptions?.[0]?.status === 'paused'
            );
            
            const monthlyRevenue = activeSubscriptions.reduce(
              (sum, player) => sum + (player.player_subscriptions?.[0]?.subscription_amount || 0),
              0
            );

            return {
              team_id: team.id,
              team_name: team.team_name,
              total_players: playersData?.length || 0,
              active_subscriptions: activeSubscriptions.length,
              paused_subscriptions: pausedSubscriptions.length,
              total_monthly_revenue: monthlyRevenue,
              players_with_subscriptions: playersWithSubscriptions
            };
          })
        );

        setSubscriptionSummary(subscriptionData);
      } catch (error) {
        console.error("Error fetching club subscription data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load club subscription data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [profile]);

  // Calculate club-wide totals
  const totalPlayers = subscriptionSummary.reduce((sum, team) => sum + team.total_players, 0);
  const totalActiveSubscriptions = subscriptionSummary.reduce((sum, team) => sum + team.active_subscriptions, 0);
  const totalPausedSubscriptions = subscriptionSummary.reduce((sum, team) => sum + team.paused_subscriptions, 0);
  const totalMonthlyRevenue = subscriptionSummary.reduce((sum, team) => sum + team.total_monthly_revenue, 0);
  const subscriptionRate = totalPlayers > 0 ? (totalActiveSubscriptions / totalPlayers) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Club Subscription Report</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <p className="text-muted-foreground">Loading subscription data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <span>Club Subscription Report</span>
        </CardTitle>
        <CardDescription>
          Overview of subscription status across all teams in your club
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>Summary</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="teams">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Teams</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Players</div>
                  <div className="text-2xl font-bold">{totalPlayers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Active Subscriptions</div>
                  <div className="text-2xl font-bold">{totalActiveSubscriptions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Monthly Revenue</div>
                  <div className="text-2xl font-bold">£{totalMonthlyRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Subscription Rate</div>
                  <div className="text-2xl font-bold">{subscriptionRate.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Team</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Active Subs</TableHead>
                    <TableHead>Paused</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionSummary.length > 0 ? (
                    subscriptionSummary.map((team) => {
                      const coverage = team.total_players > 0 
                        ? ((team.active_subscriptions / team.total_players) * 100).toFixed(1) 
                        : "0.0";
                        
                      return (
                        <TableRow key={team.team_id}>
                          <TableCell className="font-medium">{team.team_name}</TableCell>
                          <TableCell>{team.total_players}</TableCell>
                          <TableCell>{team.active_subscriptions}</TableCell>
                          <TableCell>{team.paused_subscriptions}</TableCell>
                          <TableCell>£{team.total_monthly_revenue.toFixed(2)}</TableCell>
                          <TableCell>{coverage}%</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        <p className="text-muted-foreground">No teams found in your club.</p>
                      </TableCell>
                    </TableRow>
                  )}
                  {subscriptionSummary.length > 0 && (
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="font-bold">{totalPlayers}</TableCell>
                      <TableCell className="font-bold">{totalActiveSubscriptions}</TableCell>
                      <TableCell className="font-bold">{totalPausedSubscriptions}</TableCell>
                      <TableCell className="font-bold">£{totalMonthlyRevenue.toFixed(2)}</TableCell>
                      <TableCell className="font-bold">{subscriptionRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="pt-4">
            <div className="space-y-8">
              {subscriptionSummary.map(team => (
                <div key={team.team_id} className="space-y-4">
                  <h3 className="text-lg font-semibold">{team.team_name}</h3>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Player</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.players_with_subscriptions.length > 0 ? (
                          team.players_with_subscriptions.map((player) => {
                            const subscription = player.player_subscriptions?.[0];
                            const status = subscription?.status || "inactive";
                            
                            return (
                              <TableRow key={player.id}>
                                <TableCell className="font-medium">{player.name}</TableCell>
                                <TableCell>
                                  <span className={
                                    status === 'active' 
                                      ? 'text-green-600'
                                      : status === 'paused'
                                        ? 'text-amber-600'
                                        : 'text-red-600'
                                  }>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {subscription
                                    ? `£${subscription.subscription_amount?.toFixed(2) || "0.00"}`
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              <p className="text-muted-foreground">No subscription data available for this team.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
              
              {subscriptionSummary.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No teams found in your club.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
