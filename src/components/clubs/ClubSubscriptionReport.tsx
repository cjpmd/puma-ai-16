
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function ClubSubscriptionReport() {
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      
      try {
        // Fetch club data
        const { data: clubResult, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (clubError) throw clubError;
        if (!clubResult) return;
        
        setClubData(clubResult);
        
        // Fetch teams in this club
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('id, team_name')
          .eq('club_id', clubResult.id);
          
        if (teamsError) throw teamsError;
        if (!teamsData?.length) return;
        
        const teamIds = teamsData.map(team => team.id);
        
        // Get all players in these teams
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, name, team_id')
          .in('team_id', teamIds);
          
        if (playersError) throw playersError;
        
        // Get subscription data for all players
        const { data: subsData, error: subsError } = await supabase
          .from('player_subscriptions')
          .select('*')
          .in('player_id', playersData?.map(p => p.id) || []);
          
        if (subsError) throw subsError;
        
        // Combine data for reporting
        const reportData = teamsData.map(team => {
          const teamPlayers = playersData?.filter(p => p.team_id === team.id) || [];
          const teamSubs = subsData?.filter(s => 
            teamPlayers.some(p => p.id === s.player_id)
          ) || [];
          
          const activeCount = teamSubs.filter(s => s.status === 'active').length;
          const totalAmount = teamSubs
            .filter(s => s.status === 'active')
            .reduce((sum, sub) => sum + (parseFloat(sub.subscription_amount) || 0), 0);
            
          return {
            id: team.id,
            name: team.team_name,
            playerCount: teamPlayers.length,
            subscribedCount: activeCount,
            totalMonthlyAmount: totalAmount,
            subscriptionRate: teamPlayers.length ? Math.round((activeCount / teamPlayers.length) * 100) : 0
          };
        });
        
        setSubscriptionData(reportData);
      } catch (error) {
        console.error("Error fetching club subscription data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [profile]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Club Subscription Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!clubData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Club Subscription Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No club data found.</p>
        </CardContent>
      </Card>
    );
  }

  const totalPlayers = subscriptionData.reduce((sum, team) => sum + team.playerCount, 0);
  const totalSubscribed = subscriptionData.reduce((sum, team) => sum + team.subscribedCount, 0);
  const overallRate = totalPlayers ? Math.round((totalSubscribed / totalPlayers) * 100) : 0;
  const totalMonthlyRevenue = subscriptionData.reduce((sum, team) => sum + team.totalMonthlyAmount, 0);
  const totalAnnualRevenue = totalMonthlyRevenue * 12;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Club Subscription Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Total Players</h4>
              <p className="mt-2 text-3xl font-bold">{totalPlayers}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Subscribed Players</h4>
              <p className="mt-2 text-3xl font-bold">{totalSubscribed}</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Subscription Rate</h4>
              <p className="mt-2 text-3xl font-bold">{overallRate}%</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h4>
              <p className="mt-2 text-3xl font-bold">£{totalMonthlyRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Projected Annual Revenue: <span className="font-medium">£{totalAnnualRevenue.toFixed(2)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Report Date: {format(new Date(), "PPP")}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Subscription Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Players</TableHead>
                  <TableHead className="text-right">Subscribed</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Monthly Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionData.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-right">{team.playerCount}</TableCell>
                    <TableCell className="text-right">{team.subscribedCount}</TableCell>
                    <TableCell className="text-right">{team.subscriptionRate}%</TableCell>
                    <TableCell className="text-right">£{team.totalMonthlyAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              No team subscription data available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
