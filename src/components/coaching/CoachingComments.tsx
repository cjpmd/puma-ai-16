import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSession } from "@supabase/auth-helpers-react";

interface CoachingCommentsProps {
  playerId: string;
}

export const CoachingComments = ({ playerId }: CoachingCommentsProps) => {
  const [newComment, setNewComment] = useState("");
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

  const { data: comments, refetch } = useQuery({
    queryKey: ["coaching-comments", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaching_comments')
        .select(`
          *,
          profiles:coach_id (
            name
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
      console.log('Comments data:', data);
      return data;
    },
  });

  const handleSubmitComment = async () => {
    try {
      const { error } = await supabase
        .from('coaching_comments')
        .insert([
          {
            player_id: playerId,
            coach_id: profile?.id,
            comment: newComment,
          }
        ]);

      if (error) throw error;

      setNewComment("");
      refetch();
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coaching Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a coaching comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </div>
          
          <div className="space-y-4">
            {comments?.map((comment) => (
              <div key={comment.id} className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.profiles?.name || 'Anonymous Coach'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(comment.created_at!), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-sm">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
