
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  isSubscribed: boolean;
  loading: boolean;
  subscriptionData: any;
}

const useSubscriptionStatus = (): SubscriptionStatus => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);
        
        if (!user || !profile) {
          setIsSubscribed(false);
          return;
        }
        
        // Check if user is a global admin (they get all features)
        if (profile.role === 'globalAdmin' || profile.role === 'admin') {
          setIsSubscribed(true);
          return;
        }
        
        // Check team subscription if team_id exists
        if (profile.team_id) {
          const { data: teamSubscription, error: teamError } = await supabase
            .from('team_subscriptions')
            .select('*')
            .eq('team_id', profile.team_id)
            .eq('status', 'active')
            .maybeSingle();
            
          if (teamSubscription) {
            setIsSubscribed(true);
            setSubscriptionData(teamSubscription);
            return;
          }
        }
        
        // Check personal subscription as fallback
        const { data: playerSubscription, error: playerError } = await supabase
          .from('player_subscriptions')
          .select('*')
          .eq('player_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
          
        setIsSubscribed(!!playerSubscription);
        setSubscriptionData(playerSubscription);
        
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, profile]);

  return { isSubscribed, loading, subscriptionData };
};

export default useSubscriptionStatus;
