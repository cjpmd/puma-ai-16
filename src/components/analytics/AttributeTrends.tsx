import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AttributeTrends = () => {
  const { data: trends, isLoading } = useQuery({
    queryKey: ["attribute-trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_attributes')
        .select(`
          value,
          name,
          category,
          created_at,
          players (
            name,
            player_category
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const processedData = trends?.reduce((acc: any, curr) => {
    const date = format(new Date(curr.created_at), "MMM d");
    if (!acc[curr.name]) {
      acc[curr.name] = [];
    }
    acc[curr.name].push({
      date,
      value: curr.value,
      player: curr.players.name,
      category: curr.players.player_category,
    });
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attribute Trends Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(processedData || {}).map(([attribute, data]: [string, any]) => (
            <div key={attribute} className="space-y-2">
              <h3 className="text-lg font-semibold">{attribute}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4ADE80"
                      strokeWidth={2}
                      dot={false}
                      name={attribute}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};