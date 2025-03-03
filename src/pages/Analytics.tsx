
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RadarChart } from "@/components/analytics/RadarChart";
import { ObjectiveStats } from "@/components/analytics/ObjectiveStats";
import { AttributeTrends } from "@/components/analytics/AttributeTrends";

export const Analytics = () => {
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
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <RadarChart data={radarData} title="Player Attributes" />
          <ObjectiveStats />
        </div>
        <div>
          <AttributeTrends attributeHistory={attributeHistory || {}} />
        </div>
      </div>
    </div>
  );
};
