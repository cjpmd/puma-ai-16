import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AttributeData {
  value: number;
  name: string;
  category: string;
  created_at: string;
  players: {
    name: string;
  };
}

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
          players!inner (
            name
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as AttributeData[];
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const processedData = trends?.reduce((acc: any, curr) => {
    const date = format(new Date(curr.created_at), "MMM d");
    if (!acc[curr.category]) {
      acc[curr.category] = {};
    }
    if (!acc[curr.category][curr.name]) {
      acc[curr.category][curr.name] = [];
    }
    acc[curr.category][curr.name].push({
      date,
      value: curr.value,
      player: curr.players.name,
    });
    return acc;
  }, {});

  const calculateAverages = (data: any[]) => {
    const dateValues: { [key: string]: { sum: number; count: number } } = {};
    data.forEach((item) => {
      if (!dateValues[item.date]) {
        dateValues[item.date] = { sum: 0, count: 0 };
      }
      dateValues[item.date].sum += item.value;
      dateValues[item.date].count += 1;
    });

    return Object.entries(dateValues).map(([date, { sum, count }]) => ({
      date,
      average: sum / count,
    }));
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Attribute Trends Over Time</CardTitle>
        <CardDescription>Track individual and team-wide attribute progression</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="TECHNICAL" className="space-y-4">
          <TabsList>
            {Object.keys(processedData || {}).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(processedData || {}).map(([category, attributes]: [string, any]) => (
            <TabsContent key={category} value={category} className="space-y-8">
              {Object.entries(attributes).map(([attribute, data]: [string, any]) => (
                <div key={attribute} className="space-y-2">
                  <h3 className="text-lg font-semibold">{attribute}</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
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
                          name="Individual Values"
                        />
                        <Line
                          type="monotone"
                          data={calculateAverages(data)}
                          dataKey="average"
                          stroke="#F87171"
                          strokeWidth={2}
                          dot={false}
                          name="Team Average"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};