
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSubscriptionVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const verifyPlayerSubscription = async (playerId: string) => {
    if (!playerId) return null;
    
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-player-subscription', {
        body: { playerId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast({
        title: "Error",
        description: "Failed to verify subscription status",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verifyPlayerSubscription
  };
}
