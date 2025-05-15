
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActiveSubscriptionsTable() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamSubscription, setTeamSubscription] = useState<any>(null);
  const [playerSubscriptions, setPlayerSubscriptions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Fetch team subscription
      const { data: teamSubData, error: teamSubError } = await supabase
        .from('team_subscriptions')
        .select(`
          id, 
          status,
          subscription_plan,
          subscription_amount,
          subscription_period,
          start_date,
          end_date,
          teams (team_name)
        `)
        .eq('status', 'active')
        .maybeSingle();
        
      if (teamSubError) {
        console.error("Error fetching team subscription:", teamSubError);
      } else {
        setTeamSubscription(teamSubData);
      }

      // Fetch player subscriptions
      const { data: playerSubsData, error: playerSubsError } = await supabase
        .from('player_subscriptions')
        .select(`
          id,
          player_id,
          status,
          subscription_type,
          subscription_amount,
          last_payment_date,
          next_payment_due,
          players (name, squad_number)
        `)
        .eq('status', 'active');
        
      if (playerSubsError) {
        console.error("Error fetching player subscriptions:", playerSubsError);
      } else {
        setPlayerSubscriptions(playerSubsData || []);
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
    
    toast({
      title: "Refreshed",
      description: "Subscription data has been updated",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>All current active subscriptions for your team and players</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading subscription data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Team Subscription */}
            <div>
              <h3 className="text-lg font-medium mb-4">Team Platform Subscription</h3>
              {teamSubscription ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{teamSubscription.teams?.team_name || 'Your Team'}</TableCell>
                      <TableCell>{teamSubscription.subscription_plan || 'Standard'}</TableCell>
                      <TableCell>
                        £{teamSubscription.subscription_amount?.toFixed(2) || '0.00'}
                        /{teamSubscription.subscription_period || 'month'}
                      </TableCell>
                      <TableCell>
                        {teamSubscription.end_date 
                          ? format(new Date(teamSubscription.end_date), 'dd MMM yyyy') 
                          : 'Not set'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground italic">No active team subscription</p>
              )}
            </div>
            
            {/* Player Subscriptions */}
            <div>
              <h3 className="text-lg font-medium mb-4">Player Subscriptions</h3>
              {playerSubscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Next Payment</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          {sub.players?.name || 'Player'} 
                          {sub.players?.squad_number ? ` (#${sub.players.squad_number})` : ''}
                        </TableCell>
                        <TableCell>
                          £{sub.subscription_amount?.toFixed(2) || '0.00'}/{sub.subscription_type || 'month'}
                        </TableCell>
                        <TableCell>
                          {sub.last_payment_date 
                            ? format(new Date(sub.last_payment_date), 'dd MMM yyyy') 
                            : 'Not set'}
                        </TableCell>
                        <TableCell>
                          {sub.next_payment_due 
                            ? format(new Date(sub.next_payment_due), 'dd MMM yyyy') 
                            : 'Not set'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground italic">No active player subscriptions</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
