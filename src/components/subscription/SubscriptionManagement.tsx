
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Users, Receipt, AlertCircle, CheckCircle, Pause } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const newPaymentSchema = z.object({
  playerId: z.string().uuid(),
  amount: z.string().transform((val) => parseFloat(val)),
  paymentMethod: z.enum(["manual", "direct_debit", "card", "bank_transfer", "cash"]),
  paymentDate: z.date(),
  notes: z.string().optional(),
});

export function SubscriptionManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const paymentForm = useForm<z.infer<typeof newPaymentSchema>>({
    resolver: zodResolver(newPaymentSchema),
    defaultValues: {
      amount: "50",
      paymentMethod: "manual",
      paymentDate: new Date(),
      notes: "",
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
          .maybeSingle();

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
            player_subscriptions (*)
          `)
          .eq('team_id', teamId);
          
        if (playersError) throw playersError;
        
        // Fetch payment history
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('player_payments')
          .select(`
            *,
            players (name)
          `)
          .order('payment_date', { ascending: false });
          
        if (paymentsError) throw paymentsError;
        
        setMembers(playersData || []);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [profile, toast]);

  const handleMarkAsPaid = async (playerId: string) => {
    // Open the payment dialog and set the selected player
    paymentForm.setValue("playerId", playerId);
    setOpenPaymentDialog(true);
  };

  const handleRecordPayment = async (data: z.infer<typeof newPaymentSchema>) => {
    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('name')
        .eq('id', data.playerId)
        .single();
        
      if (playerError) throw playerError;
      
      // Record the payment
      const { error: paymentError } = await supabase
        .from('player_payments')
        .insert({
          player_id: data.playerId,
          amount: data.amount,
          payment_date: data.paymentDate.toISOString(),
          payment_method: data.paymentMethod,
          notes: data.notes || "Manually recorded payment",
        });
        
      if (paymentError) throw paymentError;
      
      // Update subscription status
      const nextPaymentDate = new Date(data.paymentDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1); // Default to monthly

      const { error: subError } = await supabase
        .from('player_subscriptions')
        .upsert({
          player_id: data.playerId,
          status: "active",
          last_payment_date: data.paymentDate.toISOString(),
          next_payment_due: nextPaymentDate.toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'player_id' });
        
      if (subError) throw subError;
      
      toast({
        title: "Payment Recorded",
        description: `Payment for ${playerData.name} has been recorded`,
      });
      
      // Reset form and close dialog
      paymentForm.reset();
      setOpenPaymentDialog(false);
      
      // Refresh the data
      refreshData();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubscriptionStatus = async (playerId: string, status: 'active' | 'paused' | 'cancelled') => {
    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('name')
        .eq('id', playerId)
        .single();
        
      if (playerError) throw playerError;
      
      // Update subscription status
      const { error: subError } = await supabase
        .from('player_subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);
        
      if (subError) throw subError;
      
      let statusText;
      switch (status) {
        case 'active': statusText = "activated"; break;
        case 'paused': statusText = "paused"; break;
        case 'cancelled': statusText = "cancelled"; break;
      }
      
      toast({
        title: "Subscription Updated",
        description: `Subscription for ${playerData.name} has been ${statusText}`,
      });
      
      // Refresh the data
      refreshData();
    } catch (error) {
      console.error("Error updating subscription status:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Fetch players with their subscription status
      const { data: updatedPlayersData, error: playersError } = await supabase
        .from('players')
        .select(`
          id,
          name,
          player_subscriptions (*)
        `);
        
      if (playersError) throw playersError;
      
      // Fetch updated payment history
      const { data: updatedPaymentsData, error: paymentsError } = await supabase
        .from('player_payments')
        .select(`
          *,
          players (name)
        `)
        .order('payment_date', { ascending: false });
        
      if (paymentsError) throw paymentsError;
      
      setMembers(updatedPlayersData || []);
      setPayments(updatedPaymentsData || []);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading subscription data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <span>Subscription Management</span>
        </CardTitle>
        <CardDescription>
          Manage player subscriptions and payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList className="mb-4">
            <TabsTrigger value="members" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              <span>Payment History</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="members">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((player) => {
                      const subscription = player.player_subscriptions?.[0];
                      const isActive = subscription?.status === "active";
                      const isPaused = subscription?.status === "paused";
                      const isCancelled = subscription?.status === "cancelled";
                      const hasSubscription = !!subscription;
                      
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {isActive ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-600">Active</span>
                                </>
                              ) : isPaused ? (
                                <>
                                  <Pause className="h-4 w-4 text-amber-500" />
                                  <span className="text-amber-600">Paused</span>
                                </>
                              ) : isCancelled ? (
                                <>
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-600">Cancelled</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4 text-amber-500" />
                                  <span className="text-amber-600">Inactive</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {subscription?.last_payment_date 
                              ? format(new Date(subscription.last_payment_date), "PPP")
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            {subscription?.next_payment_due 
                              ? format(new Date(subscription.next_payment_due), "PPP")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant={isActive ? "outline" : "default"}
                                onClick={() => handleMarkAsPaid(player.id)}
                              >
                                Record Payment
                              </Button>

                              {hasSubscription && isActive && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateSubscriptionStatus(player.id, 'paused')}
                                >
                                  Pause
                                </Button>
                              )}

                              {hasSubscription && isPaused && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleUpdateSubscriptionStatus(player.id, 'active')}
                                >
                                  Activate
                                </Button>
                              )}

                              {hasSubscription && !isCancelled && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateSubscriptionStatus(player.id, 'cancelled')}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No players found. Add players to your team first.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="payments">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.payment_date), "PPP")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.players?.name || "Unknown"}
                        </TableCell>
                        <TableCell>£{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">
                          {payment.payment_method}
                        </TableCell>
                        <TableCell>{payment.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No payment records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Dialog */}
        <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Enter payment details to record a payment for this player
              </DialogDescription>
            </DialogHeader>
            
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(handleRecordPayment)} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map(player => (
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
                  control={paymentForm.control}
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
                  control={paymentForm.control}
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
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="direct_debit">Direct Debit</SelectItem>
                          <SelectItem value="manual">Manual/Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
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
                              <CreditCard className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Add any additional information about this payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Record Payment</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
