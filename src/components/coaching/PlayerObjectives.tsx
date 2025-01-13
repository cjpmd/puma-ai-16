import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";

interface PlayerObjectivesProps {
  playerId: string;
}

export const PlayerObjectives = ({ playerId }: PlayerObjectivesProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("5");
  const { toast } = useToast();
  const session = useSession();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();

      if (error) {
        console.error('Profile error:', error);
        return null;
      }
      console.log('Profile data:', data);
      return data;
    },
    enabled: !!session?.user,
  });

  const { data: objectives, refetch } = useQuery({
    queryKey: ["player-objectives", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_objectives')
        .select(`
          *,
          profiles:coach_id (
            name
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching objectives:', error);
        throw error;
      }
      console.log('Objectives data:', data);
      return data;
    },
  });

  const handleAddObjective = async () => {
    try {
      const { error } = await supabase
        .from('player_objectives')
        .insert([
          {
            player_id: playerId,
            coach_id: profile?.id,
            title,
            description,
            points: parseInt(points),
            status: 'ONGOING'
          }
        ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      setPoints("5");
      refetch();
      
      toast({
        title: "Objective Added",
        description: "New objective has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding objective:', error);
      toast({
        title: "Error",
        description: "Failed to add objective. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (objectiveId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('player_objectives')
        .update({ status: newStatus })
        .eq('id', objectiveId);

      if (error) throw error;

      refetch();
      
      toast({
        title: "Status Updated",
        description: `Objective status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Objectives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              placeholder="Objective title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Objective description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              max="20"
            />
            <Button onClick={handleAddObjective} disabled={!title.trim()}>
              Add Objective
            </Button>
          </div>

          <div className="space-y-4">
            {objectives?.map((objective) => (
              <div key={objective.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{objective.title}</h4>
                      {objective.profiles?.name && (
                        <span className="text-sm text-muted-foreground">
                          Added by {objective.profiles.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                  </div>
                  <Badge variant="secondary">{objective.points} points</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={objective.status}
                    onValueChange={(value) => handleUpdateStatus(objective.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="IMPROVING">Improving</SelectItem>
                      <SelectItem value="COMPLETE">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
