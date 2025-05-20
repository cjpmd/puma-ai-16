
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionData {
  id: string;
  status: string;
  subscription_period?: string;
  last_payment_date?: string;
  next_payment_due?: string;
  subscription_amount?: number;
}

export const SubscriptionManagement = () => {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchSubscriptions();
    }
  }, [profile]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      if (!profile || !profile.id) {
        console.error("No profile found or missing profile ID");
        return;
      }

      // For team admins, fetch team subscriptions
      if (profile.role === 'admin' || profile.role === 'manager' || profile.role === 'coach') {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('admin_id', profile.id);
          
        if (teamError) throw teamError;
        
        if (teamData && teamData.length > 0) {
          const teamIds = teamData.map(team => team.id);
          
          const { data: teamSubs, error: subsError } = await supabase
            .from('team_subscriptions')
            .select('*')
            .in('team_id', teamIds);
            
          if (subsError) throw subsError;
          
          if (teamSubs) {
            // Safely map subscription data
            const safeTeamSubs = teamSubs.map(sub => ({
              id: sub.id,
              status: sub.status || 'unknown',
              subscription_period: sub.subscription_period || 'monthly',
              last_payment_date: sub.start_date || undefined,
              next_payment_due: sub.end_date || undefined,
              subscription_amount: sub.subscription_amount || 0
            }));
            setSubscriptions(safeTeamSubs);
          }
        }
      } 
      
      // For players and parents, fetch player subscriptions
      else if (profile.role === 'player' || profile.role === 'parent') {
        const { data: playerSubs, error: playerSubsError } = await supabase
          .from('player_subscriptions')
          .select('*')
          .eq('player_id', profile.id);
          
        if (playerSubsError) throw playerSubsError;
        
        if (playerSubs) {
          // Safely map subscription data
          const safePlayerSubs = playerSubs.map(sub => ({
            id: sub.id,
            status: sub.status || 'unknown',
            subscription_period: sub.subscription_type || 'monthly',
            last_payment_date: sub.last_payment_date || undefined,
            next_payment_due: sub.next_payment_due || undefined,
            subscription_amount: sub.subscription_amount || 0
          }));
          setSubscriptions(safePlayerSubs);
        }
      }
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast('Failed to fetch subscription data', {
        description: 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // Here we would typically redirect to a customer portal or payment page
      toast('Redirecting to subscription management', {
        description: 'You will be redirected to manage your subscription'
      });
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast('Failed to manage subscription', {
        description: 'Please try again later'
      });
    }
  };

  const handleCancelSubscription = async (subId: string) => {
    try {
      toast('Subscription cancellation', {
        description: 'This would cancel your subscription in a real app'
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast('Failed to cancel subscription', {
        description: 'Please try again later'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="mb-4">You don't have any active subscriptions.</p>
          <Button onClick={handleManageSubscription}>Subscribe Now</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {subscriptions.map((sub) => (
          <div key={sub.id} className="mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                <div>
                  <h3 className="font-medium">
                    {sub.subscription_period === 'monthly' ? 'Monthly' : 'Annual'} Subscription
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className={`font-medium ${sub.status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>{sub.status}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${sub.subscription_amount}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.subscription_period === 'monthly' ? 'per month' : 'per year'}
                </p>
              </div>
            </div>
            
            <div className="mt-2 text-sm">
              {sub.last_payment_date && (
                <p>Last payment: {new Date(sub.last_payment_date).toLocaleDateString()}</p>
              )}
              {sub.next_payment_due && (
                <p>Next payment: {new Date(sub.next_payment_due).toLocaleDateString()}</p>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                Manage
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleCancelSubscription(sub.id)}
              >
                Cancel
              </Button>
            </div>
            
            <Separator className="my-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
