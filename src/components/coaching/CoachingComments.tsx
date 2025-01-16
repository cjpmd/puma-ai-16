import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useSession } from "@supabase/auth-helpers-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditCommentDialog } from "./EditCommentDialog";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CoachingCommentsProps {
  playerId: string;
}

export const CoachingComments = ({ playerId }: CoachingCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<any>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
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
      return data;
    },
  });

  const handleSubmitComment = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add comments.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('coaching_comments')
        .insert([
          {
            player_id: playerId,
            coach_id: profile.id,
            comment: newComment,
          }
        ]);

      if (error) throw error;

      setNewComment("");
      refetch();
      
      toast({
        title: "Success",
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

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;

    try {
      const { error } = await supabase
        .from('coaching_comments')
        .delete()
        .eq('id', deleteCommentId);

      if (error) throw error;

      refetch();
      setDeleteCommentId(null);
      
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
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
            <Button onClick={handleSubmitComment} disabled={!newComment.trim() || !profile?.id}>
              Add Comment
            </Button>
          </div>
          
          <ScrollArea className="h-[400px] w-full rounded-md">
            <div className="space-y-4 pr-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.profiles?.name || 'Anonymous Coach'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.created_at), "MMM d, yyyy")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingComment(comment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCommentId(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>

      {editingComment && (
        <EditCommentDialog
          comment={editingComment}
          isOpen={!!editingComment}
          onOpenChange={(open) => !open && setEditingComment(null)}
          onSuccess={refetch}
        />
      )}

      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};