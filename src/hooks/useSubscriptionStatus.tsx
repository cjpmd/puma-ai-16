
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  isSubscribed: boolean;
  loading: boolean;
  subscriptionData: any;
  subscriptionTier?: string;
  checkSubscriptionStatus?: () => Promise<void>;
}

export const useSubscriptionStatus = (): SubscriptionStatus => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string | undefined>(undefined);
  const { user, profile } = useAuth();

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      
      if (!user || !profile) {
        setIsSubscribed(false);
        return;
      }
      
      // Check if user is a global admin (they get all features)
      if (profile && (profile?.role === 'globalAdmin' || profile?.role === 'admin')) {
        setIsSubscribed(true);
        setSubscriptionTier('Enterprise');
        return;
      }
      
      // Check team subscription if team_id exists
      if (profile && profile?.team_id) {
        const { data: teamSubscription, error: teamError } = await supabase
          .from('team_subscriptions')
          .select('*')
          .eq('team_id', profile?.team_id)
          .eq('status', 'active')
          .maybeSingle();
          
        if (teamSubscription) {
          setIsSubscribed(true);
          setSubscriptionData(teamSubscription);
          setSubscriptionTier(teamSubscription.subscription_plan || 'Premium');
          return;
        }
      }
      
      // Check personal subscription as fallback
      const { data: playerSubscription, error: playerError } = await supabase
        .from('player_subscriptions')
        .select('*')
        .eq('player_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();
        
      setIsSubscribed(!!playerSubscription);
      setSubscriptionData(playerSubscription);
      if (playerSubscription) {
        setSubscriptionTier(playerSubscription.subscription_type || 'Premium');
      }
      
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user, profile]);

  return { 
    isSubscribed, 
    loading, 
    subscriptionData, 
    subscriptionTier,
    checkSubscriptionStatus 
  };
};

// For backwards compatibility with default imports
export default useSubscriptionStatus;
