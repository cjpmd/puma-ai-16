import { useState } from "react";
import { AttributeTrends } from "@/components/analytics/AttributeTrends";
import { ObjectiveStats } from "@/components/analytics/ObjectiveStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Analytics = () => {
  const [performanceFilter, setPerformanceFilter] = useState<string>("all");

  const { data: players } = useQuery({
    queryKey: ["players-with-attributes"],
    queryFn: async () => {
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select(`
          *,
          player_attributes (*)
        `);

      if (playersError) throw playersError;

      const { data: history, error: historyError } = await supabase
        .from("attribute_history")
        .select("*");

      if (historyError) throw historyError;

      return players.map((player) => {
        const attributes = player.player_attributes;
        const attributeHistory: Record<string, { date: string; value: number }[]> = {};
        
        attributes.forEach((attr: any) => {
          if (!attributeHistory[attr.name]) {
            attributeHistory[attr.name] = [];
          }
          attributeHistory[attr.name].push({
            date: attr.created_at,
            value: attr.value,
          });
        });

        return {
          ...player,
          attributes,
          attributeHistory,
        };
      });
    },
  });

  const getPlayerPerformance = (player: any) => {
    let totalChange = 0;
    let count = 0;

    player.attributes.forEach((attr: any) => {
      const history = player.attributeHistory[attr.name];
      if (history && history.length > 1) {
        const currentValue = attr.value;
        const previousValue = history[history.length - 2].value;
        totalChange += currentValue - previousValue;
        count++;
      }
    });

    const averageChange = count > 0 ? totalChange / count : 0;
    
    if (averageChange > 0) return "improving";
    if (averageChange < 0) return "needs-improvement";
    return "maintaining";
  };

  const filteredPlayers = players?.filter((player) => {
    if (performanceFilter === "all") return true;
    return getPlayerPerformance(player) === performanceFilter;
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select
          value={performanceFilter}
          onValueChange={setPerformanceFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by performance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Players</SelectItem>
            <SelectItem value="improving">Improving</SelectItem>
            <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
            <SelectItem value="maintaining">Maintaining</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredPlayers && (
        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <Card key={player.id}>
              <CardHeader>
                <CardTitle>{player.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Performance Status</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-white ${
                      getPlayerPerformance(player) === "improving" ? "bg-green-500" :
                      getPlayerPerformance(player) === "needs-improvement" ? "bg-amber-500" :
                      "bg-blue-500"
                    }`}>
                      {getPlayerPerformance(player).split("-").map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(" ")}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Category Averages</h3>
                    <div className="space-y-2">
                      {["TECHNICAL", "MENTAL", "PHYSICAL", "GOALKEEPING"].map((category) => {
                        const attrs = player.attributes.filter((attr: any) => attr.category === category);
                        if (attrs.length === 0) return null;
                        const avg = attrs.reduce((acc: number, curr: any) => acc + curr.value, 0) / attrs.length;
                        return (
                          <div key={category} className="flex justify-between">
                            <span>{category}</span>
                            <span>{avg.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="grid gap-8 md:grid-cols-2">
        <ObjectiveStats />
        <AttributeTrends />
      </div>
    </div>
  );
};