
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@supabase/auth-helpers-react";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CoachingCommentsProps {
  playerId: string;
}

export const CoachingComments = ({ playerId }: CoachingCommentsProps) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const fetchComments = async () => {
    setIsLoading(true);
    try {
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

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load coaching comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (playerId) {
      fetchComments();
    }
  }, [playerId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user?.id) return;
    
    setIsSaving(true);
    try {
      // Get the profile id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (profileError) throw profileError;

      const { error } = await supabase
        .from('coaching_comments')
        .insert([
          {
            player_id: playerId,
            coach_id: profileData.id,
            content: newComment,
          }
        ]);

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
      
      fetchComments();
      setDeleteCommentId(null);
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach's Comments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {session?.user && (
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment about this player..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-32"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={isSaving || !newComment.trim()}
                className="w-full"
              >
                {isSaving ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse rounded-md bg-slate-200 h-24 w-full"></div>
            </div>
          ) : comments.length > 0 ? (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{comment.profiles?.name || 'Anonymous Coach'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(comment.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteCommentId(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-6">No comments added yet.</p>
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
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
