import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, CheckCircle, CreditCard, AlertCircle, Users, DollarSign, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the schema for subscription settings
const subscriptionSettingsSchema = z.object({
  defaultAmount: z.coerce.number().min(0),
  subscriptionType: z.enum(["monthly", "annual"]),
  paymentDay: z.coerce.number().int().min(1).max(28),
});

// Define the schema for creating a new subscription
const newSubscriptionSchema = z.object({
  playerId: z.string().uuid(),
  amount: z.coerce.number().min(0),
  paymentMethod: z.enum(["direct_debit", "card"]),
  nextPaymentDate: z.date(),
});

export function PlayerSubscriptionManager() {
  const [subscriptionSettings, setSubscriptionSettings] = useState({
    defaultAmount: 30, // Default monthly subscription amount
    subscriptionType: "monthly" as const,
    paymentDay: 1, // Default payment day of the month
  });
  const [players, setPlayers] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Form for subscription settings
  const settingsForm = useForm<z.infer<typeof subscriptionSettingsSchema>>({
    resolver: zodResolver(subscriptionSettingsSchema),
    defaultValues: {
      defaultAmount: subscriptionSettings.defaultAmount,
      subscriptionType: subscriptionSettings.subscriptionType,
      paymentDay: subscriptionSettings.paymentDay,
    },
  });

  // Form for new subscriptions
  const newSubscriptionForm = useForm<z.infer<typeof newSubscriptionSchema>>({
    resolver: zodResolver(newSubscriptionSchema),
    defaultValues: {
      playerId: "",
      amount: subscriptionSettings.defaultAmount,
      paymentMethod: "direct_debit",
      nextPaymentDate: new Date(),
    },
  });

  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      setLoading(true);

      try {
        // First, check if team exists for the current user
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('admin_id', profile.id)
          .single();

        if (teamError) {
          console.error("Error fetching team:", teamError);
          throw new Error("No team found. Please create a team first.");
        }

        const teamId = teamData.id;

        // Fetch players with their subscription status
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select(`
            id,
            name,
            team_id,
            player_subscriptions (
              id,
              status,
              subscription_type,
              subscription_amount,
              last_payment_date,
              next_payment_due
            )
          `)
          .eq('team_id', teamId);

        if (playersError) {
          console.error("Error fetching players:", playersError);
          throw new Error("Failed to load players.");
        }

        // Fetch team subscription settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('team_subscriptions')
          .select('*')
          .eq('team_id', teamId)
          .maybeSingle();

        if (!settingsError && settingsData) {
          setSubscriptionSettings({
            defaultAmount: settingsData.subscription_amount || 30,
            subscriptionType: settingsData.subscription_period || "monthly",
            paymentDay: 1, // Default if not stored
          });

          // Update form values
          settingsForm.reset({
            defaultAmount: (settingsData.subscription_amount || 30).toString(),
            subscriptionType: settingsData.subscription_period || "monthly",
            paymentDay: "1",
          });
        }

        setPlayers(playersData || []);
        
        // Extract subscriptions into a flat array
        const allSubscriptions = playersData?.flatMap(player => 
          player.player_subscriptions?.map(sub => ({
            ...sub,
            playerName: player.name,
            playerId: player.id
          }))
        ).filter(Boolean) || [];
        
        setSubscriptions(allSubscriptions);
      } catch (error) {
        console.error("Error in fetchData:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load subscription data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const onSettingsSave = async (data: z.infer<typeof subscriptionSettingsSchema>) => {
    if (!profile) return;

    try {
      // Get team ID
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('admin_id', profile.id)
        .single();

      if (teamError) throw new Error("Team not found");

      // Update or insert team subscription settings
      const { error: updateError } = await supabase
        .from('team_subscriptions')
        .upsert({
          team_id: teamData.id,
          subscription_amount: data.defaultAmount,
          subscription_period: data.subscriptionType,
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'team_id' });

      if (updateError) throw updateError;

      setSubscriptionSettings({
        defaultAmount: data.defaultAmount,
        subscriptionType: data.subscriptionType,
        paymentDay: data.paymentDay,
      });

      toast({
        title: "Settings Updated",
        description: "Subscription settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save subscription settings",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubscription = async (data: z.infer<typeof newSubscriptionSchema>) => {
    try {
      // Find player name for the toast
      const player = players.find(p => p.id === data.playerId);
      if (!player) throw new Error("Player not found");

      // Calculate next payment due based on selected date
      const nextPaymentDue = data.nextPaymentDate.toISOString();

      // Create the subscription
      const { error } = await supabase
        .from('player_subscriptions')
        .upsert({
          player_id: data.playerId,
          status: 'active',
          subscription_type: subscriptionSettings.subscriptionType,
          subscription_amount: data.amount,
          next_payment_due: nextPaymentDue,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'player_id' });

      if (error) throw error;

      // Also insert a first payment record
      await supabase
        .from('player_payments')
        .insert({
          player_id: data.playerId,
          amount: data.amount,
          payment_date: new Date().toISOString(),
          payment_method: data.paymentMethod,
          notes: "Initial subscription setup",
        });

      toast({
        title: "Subscription Created",
        description: `Subscription for ${player.name} has been set up successfully.`,
      });

      // Refresh data
      const { data: refreshData, error: refreshError } = await supabase
        .from('players')
        .select(`
          id,
          name,
          team_id,
          player_subscriptions (
            id,
            status,
            subscription_type,
            subscription_amount,
            last_payment_date,
            next_payment_due
          )
        `)
        .eq('id', data.playerId);

      if (!refreshError && refreshData?.length > 0) {
        setPlayers(prev => {
          const newPlayers = [...prev];
          const index = newPlayers.findIndex(p => p.id === data.playerId);
          if (index !== -1) {
            newPlayers[index] = refreshData[0];
          }
          return newPlayers;
        });

        // Update subscriptions
        const newSub = refreshData[0].player_subscriptions?.[0];
        if (newSub) {
          setSubscriptions(prev => {
            // Replace if exists, add if new
            const exists = prev.findIndex(s => s.playerId === data.playerId) !== -1;
            if (exists) {
              return prev.map(s => s.playerId === data.playerId ? {
                ...newSub,
                playerName: refreshData[0].name,
                playerId: data.playerId
              } : s);
            } else {
              return [...prev, {
                ...newSub,
                playerName: refreshData[0].name,
                playerId: data.playerId
              }];
            }
          });
        }
      }

      setOpenDialog(false);
      newSubscriptionForm.reset();
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  const handleModifySubscription = async (playerId: string, action: 'pause' | 'cancel' | 'activate') => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) throw new Error("Player not found");

      let newStatus;
      let actionDescription;

      switch (action) {
        case 'pause':
          newStatus = 'paused';
          actionDescription = "paused";
          break;
        case 'cancel':
          newStatus = 'cancelled';
          actionDescription = "cancelled";
          break;
        case 'activate':
          newStatus = 'active';
          actionDescription = "activated";
          break;
      }

      const { error } = await supabase
        .from('player_subscriptions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);

      if (error) throw error;

      toast({
        title: "Subscription Updated",
        description: `Subscription for ${player.name} has been ${actionDescription}.`,
      });

      // Refresh player subscriptions
      const { data: refreshData, error: refreshError } = await supabase
        .from('player_subscriptions')
        .select('*')
        .eq('player_id', playerId);

      if (!refreshError && refreshData?.length > 0) {
        setSubscriptions(prev => {
          return prev.map(s => {
            if (s.playerId === playerId) {
              return {
                ...refreshData[0],
                playerId,
                playerName: s.playerName
              };
            }
            return s;
          });
        });

        // Update in players array too
        setPlayers(prev => {
          return prev.map(p => {
            if (p.id === playerId) {
              return {
                ...p,
                player_subscriptions: refreshData
              };
            }
            return p;
          });
        });
      }
    } catch (error) {
      console.error("Error modifying subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    }
  };

  const openAddSubscriptionDialog = (playerId?: string) => {
    if (playerId) {
      setSelectedPlayerId(playerId);
      const player = players.find(p => p.id === playerId);
      if (player) {
        newSubscriptionForm.setValue('playerId', playerId);
        newSubscriptionForm.setValue('amount', subscriptionSettings.defaultAmount);
      }
    } else {
      setSelectedPlayerId(null);
    }
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Subscriptions</CardTitle>
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
          <span>Player Subscriptions</span>
        </CardTitle>
        <CardDescription>
          Manage player subscription settings and monitor payment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="subscriptions">
          <TabsList>
            <TabsTrigger value="subscriptions">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Subscriptions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="pt-4">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Player Subscriptions</h3>
              <Button 
                onClick={() => openAddSubscriptionDialog()}
                className="flex items-center gap-2"
              >
                <span>Add Subscription</span>
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Next Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.length > 0 ? (
                    players.map((player) => {
                      const subscription = player.player_subscriptions?.[0];
                      const hasSubscription = !!subscription;
                      const isActive = hasSubscription && subscription.status === 'active';
                      const isPaused = hasSubscription && subscription.status === 'paused';
                      const isCancelled = hasSubscription && subscription.status === 'cancelled';
                      
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>
                            {hasSubscription ? (
                              <div className="flex items-center gap-1">
                                {isActive && (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-600">Active</span>
                                  </>
                                )}
                                {isPaused && (
                                  <>
                                    <Pause className="h-4 w-4 text-amber-500" />
                                    <span className="text-amber-600">Paused</span>
                                  </>
                                )}
                                {isCancelled && (
                                  <>
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-600">Cancelled</span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No subscription</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {hasSubscription 
                              ? `£${subscription.subscription_amount?.toFixed(2)}` 
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {hasSubscription && subscription.next_payment_due
                              ? format(new Date(subscription.next_payment_due), "PPP")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!hasSubscription && (
                                <Button 
                                  size="sm" 
                                  onClick={() => openAddSubscriptionDialog(player.id)}
                                >
                                  Set Up
                                </Button>
                              )}
                              {isActive && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleModifySubscription(player.id, 'pause')}
                                  >
                                    Pause
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleModifySubscription(player.id, 'cancel')}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {isPaused && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleModifySubscription(player.id, 'activate')}
                                >
                                  Activate
                                </Button>
                              )}
                              {isCancelled && (
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAddSubscriptionDialog(player.id)}
                                >
                                  Renew
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <p className="text-muted-foreground">No players found. Add players to your team first.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="pt-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Subscription Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure default subscription settings for your team
              </p>
            </div>

            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(onSettingsSave)} className="space-y-4">
                <FormField
                  control={settingsForm.control}
                  name="defaultAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Subscription Amount (£)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        The default monthly amount for new player subscriptions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="subscriptionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subscription type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Frequency of subscription payments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={settingsForm.control}
                  name="paymentDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Payment Day</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day of month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Day of the month when payments will be processed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Save Settings</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        {/* Dialog for creating/editing subscriptions */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedPlayerId ? "Update Subscription" : "Add New Subscription"}
              </DialogTitle>
              <DialogDescription>
                Set up subscription details for the player
              </DialogDescription>
            </DialogHeader>
            <Form {...newSubscriptionForm}>
              <form onSubmit={newSubscriptionForm.handleSubmit(handleCreateSubscription)} className="space-y-4">
                <FormField
                  control={newSubscriptionForm.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!selectedPlayerId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players.map(player => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newSubscriptionForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (£)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newSubscriptionForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="direct_debit">Direct Debit</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newSubscriptionForm.control}
                  name="nextPaymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next Payment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
