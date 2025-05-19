import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, User } from "lucide-react";
import { format } from "date-fns";

interface CoachingCommentsProps {
  playerId: string;
}

interface Comment {
  id: string;
  player_id: string;
  coach_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  coach?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export const CoachingComments = ({ playerId }: CoachingCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Fetch comments for this player
  useEffect(() => {
    const fetchComments = async () => {
      if (!playerId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('coaching_comments')
          .select(`
            *,
            coach:coach_id (
              name,
              email,
              avatar_url
            )
          `)
          .eq('player_id', playerId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [playerId]);
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !playerId) return;
    
    setIsSending(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        console.error('No authenticated user found');
        return;
      }
      
      // Use the correct field names for the coaching_comments table
      const { error } = await supabase
        .from('coaching_comments')
        .insert({
          player_id: playerId,
          coach_id: user.id,
          comment: newComment // Make sure to use 'comment' as per the table schema
        });
        
      if (error) throw error;
      
      // Refresh comments after adding
      const { data, error: fetchError } = await supabase
        .from('coaching_comments')
        .select(`
          *,
          coach:coach_id (
            name,
            email,
            avatar_url
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      setComments(data || []);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Coach Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-2">
          <Textarea
            placeholder="Add a coaching comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 resize-none"
            rows={3}
          />
          <Button 
            onClick={handleAddComment} 
            disabled={isSending || !newComment.trim()}
            size="icon"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 pb-3 border-b">
                <Avatar className="h-8 w-8">
                  {comment.coach?.avatar_url ? (
                    <AvatarImage src={comment.coach.avatar_url} alt={comment.coach?.name || 'Coach'} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{comment.coach?.name || 'Coach'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'PPp')}
                    </p>
                  </div>
                  <p className="text-sm mt-1">{comment.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
