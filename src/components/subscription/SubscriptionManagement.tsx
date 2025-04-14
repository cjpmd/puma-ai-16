
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Users, Receipt, AlertCircle, CheckCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch team members
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*, player_subscriptions(*)');
          
        if (playersError) throw playersError;
        
        // Fetch payment history
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('player_payments')
          .select('*, players(name)');
          
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
    try {
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('name')
        .eq('id', playerId)
        .single();
        
      if (playerError) throw playerError;
      
      // Record the payment
      const { error: paymentError } = await supabase
        .from('player_payments')
        .insert({
          player_id: playerId,
          amount: 50, // Example amount
          payment_date: new Date().toISOString(),
          payment_method: "manual",
          notes: "Manually recorded payment",
        });
        
      if (paymentError) throw paymentError;
      
      // Update subscription status
      const { error: subError } = await supabase
        .from('player_subscriptions')
        .upsert({
          player_id: playerId,
          status: "active",
          last_payment_date: new Date().toISOString(),
          next_payment_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        });
        
      if (subError) throw subError;
      
      toast({
        title: "Payment Recorded",
        description: `Payment for ${playerData.name} has been recorded`,
      });
      
      // Refresh the data
      const { data: updatedPlayersData } = await supabase
        .from('players')
        .select('*, player_subscriptions(*)');
        
      const { data: updatedPaymentsData } = await supabase
        .from('player_payments')
        .select('*, players(name)');
        
      setMembers(updatedPlayersData || []);
      setPayments(updatedPaymentsData || []);
      
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
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
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length > 0 ? (
                    members.map((player) => {
                      const subscription = player.player_subscriptions?.[0];
                      const isActive = subscription?.status === "active";
                      
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
                              ? new Date(subscription.last_payment_date).toLocaleDateString() 
                              : "Never"}
                          </TableCell>
                          <TableCell>
                            {subscription?.next_payment_due 
                              ? new Date(subscription.next_payment_due).toLocaleDateString() 
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant={isActive ? "outline" : "default"}
                              onClick={() => handleMarkAsPaid(player.id)}
                            >
                              {isActive ? "Record Payment" : "Mark as Paid"}
                            </Button>
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
                          {new Date(payment.payment_date).toLocaleDateString()}
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
      </CardContent>
    </Card>
  );
}
