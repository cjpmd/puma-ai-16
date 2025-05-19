
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

interface ParentSubscriptionManagerProps {
  playerId: string;
}

export const ParentSubscriptionManager = ({ playerId }: ParentSubscriptionManagerProps) => {
  const [subscriptionData, setSubscriptionData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('player_subscriptions')
          .select('*')
          .eq('player_id', playerId)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        setSubscriptionData(data || null);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          variant: "destructive",
          description: "Failed to load subscription data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (playerId) {
      fetchSubscriptionData();
    }
  }, [playerId, toast]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // Simulate creating a subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to subscription portal (this would typically go to a payment gateway)
      window.open(`/subscribe?playerId=${playerId}`, '_blank');
      
      toast({
        description: "Redirecting to subscription portal...",
      });
    } catch (error) {
      console.error('Error starting subscription:', error);
      toast({
        variant: "destructive",
        description: "Failed to initiate subscription process",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    try {
      // Update subscription status to 'cancelled'
      const { error } = await supabase
        .from('player_subscriptions')
        .update({ status: 'cancelled' })
        .eq('player_id', playerId);
        
      if (error) throw error;
      
      // Update local state
      setSubscriptionData({
        ...subscriptionData,
        status: 'cancelled'
      });
      
      toast({
        description: "Subscription successfully cancelled",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        description: "Failed to cancel subscription",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewSubscription = async () => {
    setIsProcessing(true);
    try {
      // Calculate next payment date
      const nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + 1);
      
      const { error } = await supabase
        .from('player_subscriptions')
        .update({ 
          status: 'active',
          last_payment_date: new Date().toISOString(),
          next_payment_due: nextPayment.toISOString()
        })
        .eq('player_id', playerId);
        
      if (error) throw error;
      
      // Update local state with the new subscription data
      const updatedSubscription = {
        ...subscriptionData,
        status: 'active',
        last_payment_date: new Date().toISOString(),
        next_payment_due: nextPayment.toISOString()
      };
      
      setSubscriptionData(updatedSubscription);
      
      toast({
        description: "Subscription successfully renewed",
      });
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast({
        variant: "destructive",
        description: "Failed to renew subscription",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse rounded-md bg-slate-200 h-32 w-full"></div>
        </div>
      ) : subscriptionData ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Subscription Details</CardTitle>
            <Badge
              variant={subscriptionData.status === 'active' ? 'default' : 'outline'}
            >
              {subscriptionData.status === 'active' ? 'Active' : 
               subscriptionData.status === 'cancelled' ? 'Cancelled' : 'Inactive'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm text-muted-foreground">Subscription Type:</span>
                <span className="text-sm font-medium">{subscriptionData.subscription_type || 'Monthly'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-medium">
                  £{parseInt(subscriptionData.subscription_amount || '0', 10).toFixed(2)}
                </span>
              </div>
              
              {subscriptionData.last_payment_date && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm text-muted-foreground">Last Payment:</span>
                  <span className="text-sm font-medium">{formatDate(subscriptionData.last_payment_date)}</span>
                </div>
              )}
              
              {subscriptionData.next_payment_due && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-sm text-muted-foreground">Next Payment:</span>
                  <span className="text-sm font-medium">{formatDate(subscriptionData.next_payment_due)}</span>
                </div>
              )}
              
              <div className="pt-4">
                {subscriptionData.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleCancelSubscription} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleRenewSubscription} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Renew Subscription'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Subscribe to support the team and unlock premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleSubscribe} 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Subscribe Now'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
