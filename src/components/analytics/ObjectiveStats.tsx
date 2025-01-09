import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
            name
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectives Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span>Completion Rate</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold">{completedObjectives}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold">{improvingObjectives}</div>
              <div className="text-sm text-muted-foreground">Improving</div>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold">{ongoingObjectives}</div>
              <div className="text-sm text-muted-foreground">Ongoing</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};