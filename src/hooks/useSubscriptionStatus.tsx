
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useSubscriptionStatus = () => {
  const { profile } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      setLoading(true);
      try {
        // Safely check if profile exists and has an id
        if (!profile || !profile.id) {
          console.log("No profile found or profile without id");
          setIsSubscribed(false);
          return;
        }

        // Check player subscription first if the user is a player
        if (profile.role === 'player') {
          const { data, error } = await supabase
            .from('player_subscriptions')
            .select('*')
            .eq('player_id', profile.id)
            .eq('status', 'active')
            .single();

          if (!error && data) {
            setIsSubscribed(true);
            setSubscriptionData(data);
            return;
          }
        }

        // Check for team subscription
        if (profile.team_id) {
          const { data, error } = await supabase
            .from('team_subscriptions')
            .select('*')
            .eq('team_id', profile.team_id)
            .eq('status', 'active')
            .single();

          if (!error && data) {
            setIsSubscribed(true);
            setSubscriptionData(data);
            return;
          }
        }

        // No subscription found, set to false
        setIsSubscribed(false);
        setSubscriptionData(null);

      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsSubscribed(false);
        setSubscriptionData(null);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
      setIsSubscribed(false);
    }
  }, [profile]);

  return { isSubscribed, loading, subscriptionData };
};

export default useSubscriptionStatus;
