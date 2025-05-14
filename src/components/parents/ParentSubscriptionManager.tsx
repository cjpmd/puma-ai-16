
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
import { CreditCard, CheckCircle, AlertCircle, Pause } from "lucide-react";

// Schema for payment method update
const paymentMethodSchema = z.object({
  paymentMethod: z.enum(["direct_debit", "card"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  accountNumber: z.string().optional(),
  sortCode: z.string().optional(),
});

export function ParentSubscriptionManager({ playerId }: { playerId: string }) {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const paymentForm = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      paymentMethod: "direct_debit",
    },
  });

  useEffect(() => {
    if (!playerId) return;

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('player_subscriptions')
          .select('*')
          .eq('player_id', playerId)
          .maybeSingle();

        if (error) throw error;
        setSubscription(data);

        // If subscription exists, set the payment method form default
        if (data) {
          const method = data.payment_method || "direct_debit";
          paymentForm.setValue("paymentMethod", method);
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

  const handleUpdatePaymentMethod = async (data: z.infer<typeof paymentMethodSchema>) => {
    try {
      if (!subscription) {
        toast({
          title: "Error",
          description: "No active subscription found",
          variant: "destructive",
        });
        return;
      }

      // In a real app, you'd process the payment details securely here
      // For demo purposes, we'll just update the payment method
      const { error } = await supabase
        .from('player_subscriptions')
        .update({
          payment_method: data.paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);

      if (error) throw error;

      toast({
        title: "Payment Method Updated",
        description: "Your payment method has been updated successfully",
      });

      // Update local state
      setSubscription({
        ...subscription,
        payment_method: data.paymentMethod,
      });

      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    }
  };

  const handlePauseSubscription = async () => {
    try {
      const { error } = await supabase
        .from('player_subscriptions')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);

      if (error) throw error;

      toast({
        title: "Subscription Paused",
        description: "Your subscription has been paused. You can activate it again at any time.",
      });

      // Update local state
      setSubscription({
        ...subscription,
        status: 'paused',
      });
    } catch (error) {
      console.error("Error pausing subscription:", error);
      toast({
        title: "Error",
        description: "Failed to pause subscription",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { error } = await supabase
        .from('player_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled.",
      });

      // Update local state
      setSubscription({
        ...subscription,
        status: 'cancelled',
      });

      setConfirmCancel(false);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const handleActivateSubscription = async () => {
    try {
      const { error } = await supabase
        .from('player_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('player_id', playerId);

      if (error) throw error;

      toast({
        title: "Subscription Activated",
        description: "Your subscription is now active.",
      });

      // Update local state
      setSubscription({
        ...subscription,
        status: 'active',
      });
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to activate subscription",
        variant: "destructive",
      });
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
  const isCancelled = subscription?.status === 'cancelled';
  const hasSubscription = !!subscription;

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
        {hasSubscription ? (
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
                    <p className="font-medium">Subscription Cancelled</p>
                    <p className="text-sm text-muted-foreground">
                      Your subscription has been cancelled. You can set up a new subscription at any time.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead className="w-1/3">Subscription Amount</TableHead>
                    <TableCell>£{subscription.subscription_amount?.toFixed(2) || "0.00"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Payment Frequency</TableHead>
                    <TableCell className="capitalize">{subscription.subscription_type || "Monthly"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableCell className="capitalize">{subscription.payment_method || "Direct Debit"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Next Payment Date</TableHead>
                    <TableCell>
                      {subscription.next_payment_due 
                        ? format(new Date(subscription.next_payment_due), "PPP") 
                        : "Not scheduled"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>Last Payment</TableHead>
                    <TableCell>
                      {subscription.last_payment_date 
                        ? format(new Date(subscription.last_payment_date), "PPP") 
                        : "None"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog(true)}
                disabled={isCancelled}
              >
                Update Payment Method
              </Button>

              {isActive && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handlePauseSubscription}
                  >
                    Pause Subscription
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
              
              {isPaused && (
                <>
                  <Button 
                    variant="default"
                    onClick={handleActivateSubscription}
                  >
                    Activate Subscription
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setConfirmCancel(true)}
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}

              {isCancelled && (
                <Button variant="default">
                  Set Up New Subscription
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <p className="text-muted-foreground">No active subscription found for this player.</p>
            <p className="text-sm">Contact your team administrator to set up a subscription.</p>
          </div>
        )}

        {/* Dialog for updating payment method */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Payment Method</DialogTitle>
              <DialogDescription>
                Change how you want to pay for your subscription
              </DialogDescription>
            </DialogHeader>
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(handleUpdatePaymentMethod)} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset form fields based on selection
                          if (value === 'card') {
                            paymentForm.resetField('accountNumber');
                            paymentForm.resetField('sortCode');
                          } else {
                            paymentForm.resetField('cardNumber');
                            paymentForm.resetField('cardExpiry');
                          }
                        }}
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

                {paymentForm.watch("paymentMethod") === "card" && (
                  <>
                    <FormField
                      control={paymentForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="XXXX XXXX XXXX XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="cardExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Expiry (MM/YY)</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/YY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {paymentForm.watch("paymentMethod") === "direct_debit" && (
                  <>
                    <FormField
                      control={paymentForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="sortCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Code</FormLabel>
                          <FormControl>
                            <Input placeholder="12-34-56" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Confirmation dialog for cancellation */}
        <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your subscription? This will stop all future payments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelSubscription}>
                Yes, Cancel Subscription
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
