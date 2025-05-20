
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionVerification } from "@/hooks/calendar/useSubscriptionVerification";

export function useSubscriptionStatus() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const { verifyPlayerSubscription } = useSubscriptionVerification();

  const checkSubscriptionStatus = async () => {
    setIsLoading(true);
    
    try {
      // Make sure profile is defined before accessing its properties
      if (!profile) {
        setIsSubscribed(false);
        setIsLoading(false);
        return;
      }
      
      // First check team subscription
      const { data: teamSub } = await supabase
        .from('team_subscriptions')
        .select('status, subscription_plan')
        .eq('status', 'active')
        .single();
      
      if (teamSub) {
        setIsSubscribed(true);
        setSubscriptionTier(teamSub.subscription_plan || 'premium');
        setIsLoading(false);
        return;
      }
      
      // If no team subscription, check for player-specific subscription
      if (profile) {
        // Use optional chaining to safely access id
        const profileId = profile?.id;
        
        if (profileId) {
          const subscriptionData = await verifyPlayerSubscription(profileId);
          
          if (subscriptionData && subscriptionData.status === 'active') {
            setIsSubscribed(true);
            setSubscriptionTier(subscriptionData.tier || 'premium');
          } else {
            setIsSubscribed(false);
            setSubscriptionTier(null);
          }
        } else {
          console.warn('Unable to check player subscription: profile.id is not available');
          setIsSubscribed(false);
          setSubscriptionTier(null);
        }
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      checkSubscriptionStatus();
    }
  }, [profile]);

  return {
    isSubscribed,
    isLoading,
    subscriptionTier,
    checkSubscriptionStatus
  };
}
