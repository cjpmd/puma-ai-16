
import React from 'react';
import { SubscriptionBanner } from '@/components/subscription/SubscriptionBanner';
import { BasicAnalytics } from '@/components/analytics/BasicAnalytics';
import { EnhancedAnalytics } from '@/components/analytics/EnhancedAnalytics';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';

const Analytics = () => {
  const { isSubscribed, loading: isLoading, subscriptionData } = useSubscriptionStatus();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <SubscriptionBanner isSubscribed={isSubscribed} isLoading={isLoading} />
      
      <BasicAnalytics />
      
      {isSubscribed && <EnhancedAnalytics />}
    </div>
  );
};

export default Analytics;
