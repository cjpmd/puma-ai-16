
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { BasicAnalytics } from "@/components/analytics/BasicAnalytics";
import { EnhancedAnalytics } from "@/components/analytics/EnhancedAnalytics";
import { RadarChart } from "@/components/analytics/RadarChart";
import { ObjectiveStats } from "@/components/analytics/ObjectiveStats";
import { AttributeTrends } from "@/components/analytics/AttributeTrends";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";

export const Analytics = () => {
  const { isSubscribed, isLoading } = useSubscriptionStatus();
  
  const { data: playerAttributes } = useQuery({
    queryKey: ["player-attributes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_attributes")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Query for attribute history data
  const { data: attributeHistory } = useQuery({
    queryKey: ["attribute-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_attributes")
        .select("name, value, created_at, player_id")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      
      // Transform data into the format expected by AttributeTrends
      const history: Record<string, { date: string; value: number }[]> = {};
      
      data?.forEach(attr => {
        const key = attr.name;
        if (!history[key]) {
          history[key] = [];
        }
        
        history[key].push({
          date: attr.created_at,
          value: attr.value
        });
      });
      
      return history;
    }
  });

  // Transform data for radar chart
  const radarData = playerAttributes?.map(attr => ({
    name: attr.name,
    value: attr.value
  })) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Visualize performance data and track development metrics
          </p>
        </div>
        
        {isSubscribed && (
          <div className="flex items-center mt-2 md:mt-0 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <Unlock className="h-4 w-4 mr-1" />
            Premium Analytics Enabled
          </div>
        )}
      </div>
      
      <SubscriptionBanner isSubscribed={isSubscribed} isLoading={isLoading} />
      
      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Analytics</TabsTrigger>
          <TabsTrigger 
            value="enhanced"
            disabled={!isSubscribed && !isLoading}
            className={!isSubscribed && !isLoading ? "relative" : ""}
          >
            {!isSubscribed && !isLoading && (
              <Lock className="h-3 w-3 absolute right-2 top-1/2 transform -translate-y-1/2" />
            )}
            Enhanced Analytics
          </TabsTrigger>
          <TabsTrigger value="legacy">Legacy Views</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <BasicAnalytics />
        </TabsContent>
        
        <TabsContent value="enhanced">
          {isSubscribed ? (
            <EnhancedAnalytics />
          ) : (
            <div className="text-center py-10">
              <Lock className="mx-auto h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Premium Feature Locked</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enhanced analytics is available exclusively for premium subscribers.
                Upgrade your plan to access comprehensive data insights.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="legacy">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <RadarChart data={radarData} title="Player Attributes" />
              <ObjectiveStats />
            </div>
            <div>
              <AttributeTrends attributeHistory={attributeHistory || {}} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="text-sm text-muted-foreground">
        <p>Data last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};
