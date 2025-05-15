import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClubSubscriptionReportProps {
  clubId?: string;
}

export function ClubSubscriptionReport({ clubId }: ClubSubscriptionReportProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clubSubscription, setClubSubscription] = useState<any>(null);
  const [teamSubscriptions, setTeamSubscriptions] = useState<any[]>([]);
  const [globalSubscriptions, setGlobalSubscriptions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, [clubId]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Fetch club subscription for the selected club
      if (clubId) {
        const { data: clubSubData, error: clubSubError } = await supabase
          .from('club_subscriptions')
          .select(`
            id, 
            status,
            subscription_plan,
            subscription_amount,
            subscription_period,
            start_date,
            end_date,
            clubs (name)
          `)
          .eq('status', 'active')
          .eq('club_id', clubId)
          .maybeSingle();
          
        if (clubSubError) {
          console.error("Error fetching club subscription:", clubSubError);
        } else {
          setClubSubscription(clubSubData);
        }
      }

      // Fetch team subscriptions that are part of this club
      const { data: teamSubsData, error: teamSubsError } = await supabase
        .from('team_subscriptions')
        .select(`
          id,
          team_id,
          status,
          subscription_plan,
          subscription_amount,
          start_date,
          end_date,
          teams (team_name, club_id)
        `)
        .eq('status', 'active');
        
      if (teamSubsError) {
        console.error("Error fetching team subscriptions:", teamSubsError);
      } else {
        // If clubId is provided, filter to only teams in this club
        if (clubId) {
          const filteredTeams = teamSubsData?.filter(sub => {
            // Fix the TypeScript error by properly checking club_id existence
            return sub.teams && 
                   typeof sub.teams === 'object' && 
                   'club_id' in sub.teams && 
                   sub.teams.club_id === clubId;
          }) || [];
          
          setTeamSubscriptions(filteredTeams);
        } else {
          setTeamSubscriptions(teamSubsData || []);
        }
      }
      
      // Fetch all club subscriptions for the global view
      const { data: allClubSubs, error: allClubSubsError } = await supabase
        .from('club_subscriptions')
        .select(`
          id, 
          club_id,
          status,
          subscription_plan,
          subscription_amount,
          subscription_period,
          start_date,
          end_date,
          clubs (name)
        `)
        .eq('status', 'active');
        
      if (allClubSubsError) {
        console.error("Error fetching all club subscriptions:", allClubSubsError);
      } else {
        setGlobalSubscriptions(allClubSubs || []);
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

  const renderSubscriptionTable = (subscriptions: any[], type: 'club' | 'team') => {
    if (subscriptions.length === 0) {
      return (
        <p className="text-muted-foreground italic">No active {type} subscriptions</p>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{type === 'club' ? 'Club' : 'Team'}</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Renewal Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>
                {type === 'club' 
                  ? (sub.clubs?.name || 'Club') 
                  : (sub.teams?.team_name || 'Team')}
              </TableCell>
              <TableCell>{sub.subscription_plan || 'Standard'}</TableCell>
              <TableCell>
                £{sub.subscription_amount?.toFixed(2) || '0.00'}
                /{sub.subscription_period || 'month'}
              </TableCell>
              <TableCell>
                {sub.end_date 
                  ? format(new Date(sub.end_date), 'dd MMM yyyy') 
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
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Subscription details for your club and associated teams</CardDescription>
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
          <Tabs defaultValue="current">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Club</TabsTrigger>
              <TabsTrigger value="global">Global View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-8">
              {/* Club Subscription */}
              <div>
                <h3 className="text-lg font-medium mb-4">Club Platform Subscription</h3>
                {clubId ? (
                  clubSubscription ? renderSubscriptionTable([clubSubscription], 'club') : 
                  <p className="text-muted-foreground italic">No active club subscription</p>
                ) : (
                  <p className="text-muted-foreground italic">Select a club to view its subscription</p>
                )}
              </div>
              
              {/* Team Subscriptions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Team Subscriptions</h3>
                {teamSubscriptions.length > 0 
                  ? renderSubscriptionTable(teamSubscriptions, 'team')
                  : <p className="text-muted-foreground italic">No active team subscriptions</p>
                }
              </div>
            </TabsContent>
            
            <TabsContent value="global" className="space-y-8">
              {/* All Club Subscriptions */}
              <div>
                <h3 className="text-lg font-medium mb-4">All Club Subscriptions</h3>
                {globalSubscriptions.length > 0 
                  ? renderSubscriptionTable(globalSubscriptions, 'club')
                  : <p className="text-muted-foreground italic">No active club subscriptions</p>
                }
              </div>
              
              {/* All Team Subscriptions */}
              <div>
                <h3 className="text-lg font-medium mb-4">All Team Subscriptions</h3>
                {teamSubscriptions.length > 0 
                  ? renderSubscriptionTable(teamSubscriptions, 'team')
                  : <p className="text-muted-foreground italic">No active team subscriptions</p>
                }
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
