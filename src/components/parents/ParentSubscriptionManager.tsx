
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CreditCard, CheckCircle, AlertCircle, Pause, Loader2 } from "lucide-react";

// Schema for payment method update
const paymentMethodSchema = z.object({
  paymentMethod: z.enum(["direct_debit", "card"]),
  parentEmail: z.string().email("Please enter a valid email address"),
  amount: z.string().transform((val) => parseFloat(val))
});

export function ParentSubscriptionManager({ playerId }: { playerId: string }) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();

  const paymentForm = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentMethod: "direct_debit",
      parentEmail: "",
      amount: "0"
    },
  });

  useEffect(() => {
    if (!playerId) return;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        // Fetch the player's parent details
        const { data: parentsData, error: parentsError } = await supabase
          .from('player_parents')
          .select('*')
          .eq('player_id', playerId);
          
        if (parentsError) throw parentsError;
        setParents(parentsData || []);
        
        // If there's a parent with an email, set it as the default
        if (parentsData && parentsData.length > 0 && parentsData[0].email) {
          paymentForm.setValue("parentEmail", parentsData[0].email);
        }
        
        // Fetch local subscription record
        const { data, error } = await supabase
          .from('player_subscriptions')
          .select('*')
          .eq('player_id', playerId)
          .maybeSingle();

        if (error) throw error;
        
        // Get team subscription settings for default amount
        const { data: teamData } = await supabase
          .from('teams')
          .select('id')
          .eq('admin_id', profile?.id || '')
          .maybeSingle();
          
        if (teamData) {
          const { data: teamSubData } = await supabase
            .from('team_subscriptions')
            .select('subscription_amount')
            .eq('team_id', teamData.id)
            .maybeSingle();
            
          if (teamSubData && teamSubData.subscription_amount) {
            paymentForm.setValue("amount", teamSubData.subscription_amount.toString());
          }
        }
        
        setSubscription(data);
        
        // If subscription exists, also verify it with Stripe
        if (data) {
          verifySubscriptionWithStripe();
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [playerId]);
  
  const verifySubscriptionWithStripe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-player-subscription', {
        body: { playerId }
      });
      
      if (error) throw error;
      
      if (data.subscribed) {
        setSubscription(prev => ({
          ...prev,
          ...data,
          status: data.status,
          subscription_amount: data.amount,
          next_payment_due: data.next_payment_due,
          payment_method: data.payment_method
        }));
      }
    } catch (error) {
      console.error("Error verifying subscription with Stripe:", error);
    }
  };

  const handleSetupSubscription = async (data: z.infer<typeof paymentMethodSchema>) => {
    if (!playerId) {
      toast({
        title: "Error",
        description: "Player ID is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessingAction(true);
      
      // Get team ID 
      const { data: teamData, error: teamError } = await supabase
        .from('players')
        .select('team_id')
        .eq('id', playerId)
        .single();
        
      if (teamError) throw teamError;
      const teamId = teamData.team_id;
      
      if (!teamId) {
        throw new Error("Player is not associated with a team");
      }
      
      const { data: response, error } = await supabase.functions.invoke('create-player-subscription', {
        body: {
          playerId,
          amount: data.amount,
          parentEmail: data.parentEmail,
          paymentMethod: data.paymentMethod,
          teamId
        }
      });
      
      if (error) throw error;
      if (!response.url) throw new Error("No checkout URL returned");
      
      // Open Stripe checkout in a new tab
      window.open(response.url, '_blank');
      
      toast({
        title: "Subscription Initiated",
        description: "Please complete the subscription setup in the new window.",
      });
      
      setOpenDialog(false);
    } catch (error) {
      console.error("Error setting up subscription:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up subscription",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription) {
      toast({
        title: "Error",
        description: "No active subscription found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessingAction(true);
      
      // Find parent email
      if (parents.length === 0 || !parents[0].email) {
        throw new Error("No parent email found for this player");
      }
      
      const parentEmail = parents[0].email;
      
      const { data: response, error } = await supabase.functions.invoke('player-subscription-portal', {
        body: {
          playerId,
          parentEmail
        }
      });
      
      if (error) throw error;
      if (!response.url) throw new Error("No portal URL returned");
      
      // Open Stripe customer portal in a new tab
      window.open(response.url, '_blank');
      
      toast({
        title: "Subscription Management",
        description: "Subscription management portal opened in a new window.",
      });
    } catch (error) {
      console.error("Error managing subscription:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <p className="text-muted-foreground">Loading subscription details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = subscription?.status === 'active';
  const isPaused = subscription?.status === 'paused';
  const isCancelled = !subscription || subscription?.status === 'cancelled';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <span>Player Subscription</span>
        </CardTitle>
        <CardDescription>
          Manage your player's subscription payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-2 p-4 rounded-md bg-gray-50 border">
            {isActive && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Active Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription is active and payments are being processed automatically.
                  </p>
                </div>
              </>
            )}
            {isPaused && (
              <>
                <Pause className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Subscription Paused</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription is currently paused. No payments will be taken until you reactivate.
                  </p>
                </div>
              </>
            )}
            {isCancelled && (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">No Active Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    There is no active subscription for this player. Set up a subscription below.
                  </p>
                </div>
              </>
            )}
          </div>

          {!isCancelled && (
            <div className="rounded-md border">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-1/3">Subscription Amount</TableHead>
                    <TableCell>£{subscription?.subscription_amount?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Payment Frequency</TableHead>
                    <TableCell className="capitalize">{subscription?.subscription_type || "Monthly"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableCell className="capitalize">{subscription?.payment_method || "Direct Debit"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Next Payment Date</TableHead>
                    <TableCell>
                      {subscription?.next_payment_due 
                        ? format(new Date(subscription.next_payment_due), "PPP") 
                        : "Not scheduled"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Last Payment</TableHead>
                    <TableCell>
                      {subscription?.last_payment_date 
                        ? format(new Date(subscription.last_payment_date), "PPP") 
                        : "None"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isCancelled ? (
              <Button 
                variant="default" 
                onClick={() => setOpenDialog(true)}
                disabled={processingAction || parents.length === 0}
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  "Set Up Subscription"
                )}
              </Button>
            ) : (
              <Button 
                variant={isActive ? "default" : "outline"}
                onClick={handleManageSubscription}
                disabled={processingAction}
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Manage Subscription"
                )}
              </Button>
            )}
            
            {parents.length === 0 && (
              <p className="text-sm text-yellow-600 mt-2">
                You need to add a parent with a valid email address to set up a subscription.
              </p>
            )}
          </div>
        </div>

        {/* Dialog for setting up subscription */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Up Subscription</DialogTitle>
              <DialogDescription>
                Set up a recurring payment for this player
              </DialogDescription>
            </DialogHeader>
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(handleSetupSubscription)} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="parent@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Amount (£)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="1" {...field} />
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
                          <SelectItem value="direct_debit">Direct Debit</SelectItem>
                          <SelectItem value="card">Card Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={processingAction}>
                    {processingAction ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Set Up Payment"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
