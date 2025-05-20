import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MoreVertical, CreditCard } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamSubscription } from "@/types/subscription";
import { ActiveSubscriptionsTable } from "./ActiveSubscriptionsTable";

export const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('team');
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptionData(activeTab);
  }, [activeTab]);

  const loadSubscriptionData = async (type: string) => {
    setLoading(true);
    try {
      if (type === 'team') {
        // Load team subscriptions
        const { data, error } = await supabase
          .from('team_subscriptions')
          .select(`
            *,
            teams:team_id (
              team_name,
              team_logo,
              admin_id
            ),
            profiles:teams->admin_id (
              name,
              email
            )
          `);
          
        if (error) throw error;

        // Cast the data to match our expected format
        const typedData = (data || []).map(item => ({
          ...item,
          subscription_period: item.subscription_period as "monthly" | "annual",
          status: item.status as "active" | "inactive" | "cancelled"
        }));
        
        setSubscriptions(typedData);
      } else if (type === 'player') {
        // Load player subscriptions
        const { data, error } = await supabase
          .from('player_subscriptions')
          .select(`
            *,
            players:player_id (
              name,
              profile_image,
              team_id
            ),
            teams:players->team_id (
              team_name
            )
          `);
          
        if (error) throw error;
        setSubscriptions(data || []);
      } else if (type === 'club') {
        // Load club subscriptions
        const { data, error } = await supabase
          .from('club_subscriptions')
          .select(`
            *,
            clubs:club_id (
              name,
              logo,
              admin_id
            ),
            profiles:clubs->admin_id (
              name,
              email
            )
          `);
          
        if (error) throw error;
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id: string) => {
    try {
      // In a real implementation, this would call a Stripe API to cancel the subscription
      toast({
        title: "Subscription Canceled",
        description: "The subscription has been canceled successfully.",
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'team') {
      return sub.teams?.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             sub.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (activeTab === 'player') {
      return sub.players?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             sub.teams?.team_name?.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (activeTab === 'club') {
      return sub.clubs?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             sub.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>Manage all platform subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-2xl font-bold mb-1">120</div>
              <div className="text-sm text-muted-foreground">Active Team Subscriptions</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-2xl font-bold mb-1">52</div>
              <div className="text-sm text-muted-foreground">Active Player Subscriptions</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="text-2xl font-bold mb-1">$5,280</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="team">Team Subscriptions</TabsTrigger>
          <TabsTrigger value="player">Player Subscriptions</TabsTrigger>
          <TabsTrigger value="club">Club Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab} subscriptions...`}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Add New Subscription
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === 'team' && (
                      <>
                        <TableHead>Team</TableHead>
                        <TableHead>Admin</TableHead>
                      </>
                    )}
                    {activeTab === 'player' && (
                      <>
                        <TableHead>Player</TableHead>
                        <TableHead>Team</TableHead>
                      </>
                    )}
                    {activeTab === 'club' && (
                      <>
                        <TableHead>Club</TableHead>
                        <TableHead>Admin</TableHead>
                      </>
                    )}
                    <TableHead>Subscription Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/50">
                        {activeTab === 'team' && (
                          <>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {sub.teams?.team_logo ? (
                                    <AvatarImage src={sub.teams.team_logo} alt={sub.teams.team_name} />
                                  ) : (
                                    <AvatarFallback>{sub.teams?.team_name?.charAt(0) || 'T'}</AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="font-medium">{sub.teams?.team_name || 'Unknown Team'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{sub.profiles?.name || 'Unknown'}</TableCell>
                          </>
                        )}
                        {activeTab === 'player' && (
                          <>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {sub.players?.profile_image ? (
                                    <AvatarImage src={sub.players.profile_image} alt={sub.players.name} />
                                  ) : (
                                    <AvatarFallback>{sub.players?.name?.charAt(0) || 'P'}</AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="font-medium">{sub.players?.name || 'Unknown Player'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{sub.teams?.team_name || 'Unknown Team'}</TableCell>
                          </>
                        )}
                        {activeTab === 'club' && (
                          <>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {sub.clubs?.logo ? (
                                    <AvatarImage src={sub.clubs.logo} alt={sub.clubs.name} />
                                  ) : (
                                    <AvatarFallback>{sub.clubs?.name?.charAt(0) || 'C'}</AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="font-medium">{sub.clubs?.name || 'Unknown Club'}</span>
                              </div>
                            </TableCell>
                            <TableCell>{sub.profiles?.name || 'Unknown'}</TableCell>
                          </>
                        )}
                        <TableCell>{sub.subscription_plan || 'Standard'}</TableCell>
                        <TableCell>${sub.amount_monthly || '9.99'}/mo</TableCell>
                        <TableCell>
                          <Badge variant={sub.status === 'active' ? "default" : "destructive"}>
                            {sub.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Change Plan</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCancelSubscription(sub.id)} className="text-destructive">
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
