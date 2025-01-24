import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const ObjectiveStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["objective-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_objectives')
        .select(`
          status,
          points,
          players (
            name,
            team_category
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const totalObjectives = stats?.length || 0;
  const completedObjectives = stats?.filter(obj => obj.status === 'COMPLETE').length || 0;
  const ongoingObjectives = stats?.filter(obj => obj.status === 'ONGOING').length || 0;
  const improvingObjectives = stats?.filter(obj => obj.status === 'IMPROVING').length || 0;

  const completionRate = (completedObjectives / totalObjectives) * 100;

  const pieData = [
    { name: 'Completed', value: completedObjectives, color: '#4ADE80' },
    { name: 'Improving', value: improvingObjectives, color: '#FBBF24' },
    { name: 'Ongoing', value: ongoingObjectives, color: '#60A5FA' },
  ];

  const averagePoints = stats?.reduce((acc, obj) => acc + (obj.points || 0), 0) / totalObjectives || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectives Overview</CardTitle>
        <CardDescription>Track team-wide objective completion and progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span>Overall Completion Rate</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-100 rounded-lg dark:bg-green-900">
              <div className="text-2xl font-bold">{completedObjectives}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg dark:bg-yellow-900">
              <div className="text-2xl font-bold">{improvingObjectives}</div>
              <div className="text-sm text-muted-foreground">Improving</div>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg dark:bg-blue-900">
              <div className="text-2xl font-bold">{ongoingObjectives}</div>
              <div className="text-sm text-muted-foreground">Ongoing</div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
            <div className="text-2xl font-bold">{averagePoints.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Average Points per Objective</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};