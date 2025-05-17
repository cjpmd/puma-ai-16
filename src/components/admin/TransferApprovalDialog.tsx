
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Check, X } from "lucide-react";
import { format } from 'date-fns';

interface TransferApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: any;
  onSuccess: () => void;
}

export const TransferApprovalDialog = ({
  open,
  onOpenChange,
  transfer,
  onSuccess
}: TransferApprovalDialogProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [fromTeam, setFromTeam] = useState<any>(null);
  const [toTeam, setToTeam] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open && transfer) {
      fetchTransferDetails();
    }
  }, [open, transfer]);

  const fetchTransferDetails = async () => {
    setLoading(true);
    try {
      // Get player details
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select(`
          *,
          player_attributes (*),
          position_suitability (
            suitability_score,
            position_definitions (abbreviation, full_name)
          )
        `)
        .eq('id', transfer.player_id)
        .single();
        
      if (playerError) throw playerError;
      setPlayer(playerData);
      
      // Get from team details
      if (transfer.from_team_id) {
        const { data: fromTeamData, error: fromTeamError } = await supabase
          .from('teams')
          .select(`
            *,
            club:club_id (*)
          `)
          .eq('id', transfer.from_team_id)
          .single();
          
        if (fromTeamError) console.error("Error fetching from team:", fromTeamError);
        else setFromTeam(fromTeamData);
      }
      
      // Get to team details
      if (transfer.to_team_id) {
        const { data: toTeamData, error: toTeamError } = await supabase
          .from('teams')
          .select(`
            *,
            club:club_id (*)
          `)
          .eq('id', transfer.to_team_id)
          .single();
          
        if (toTeamError) console.error("Error fetching to team:", toTeamError);
        else setToTeam(toTeamData);
      }
      
      // Get player stats
      try {
        const { data: statsData } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', transfer.player_id)
          .maybeSingle();
          
        if (statsData) setPlayerStats(statsData);
      } catch (statsError) {
        console.error("Error fetching player stats:", statsError);
      }
    } catch (error) {
      console.error("Error fetching transfer details:", error);
      toast({
        title: "Error",
        description: "Failed to load transfer details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    setSaving(true);
    try {
      // Update the transfer status
      const { error: updateError } = await supabase
        .from('player_transfers')
        .update({ 
          status: approved ? 'completed' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', transfer.id);
        
      if (updateError) throw updateError;
      
      // If approved, update the player's team_id
      if (approved) {
        const { error: playerUpdateError } = await supabase
          .from('players')
          .update({ 
            team_id: transfer.to_team_id,
            status: 'active'
          })
          .eq('id', transfer.player_id);
          
        if (playerUpdateError) throw playerUpdateError;
      }
      
      toast({
        title: "Success",
        description: approved ? "Transfer approved successfully" : "Transfer rejected",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error processing transfer approval:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process transfer",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Approval</DialogTitle>
          <DialogDescription>
            Review and approve or reject this player transfer
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Transfer Details */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{player?.name}</h3>
              <p className="text-sm text-muted-foreground">
                Transfer requested on {formatDate(transfer?.created_at)}
              </p>
              <Badge variant={
                transfer?.status === 'pending' ? 'outline' : 
                transfer?.status === 'completed' ? 'default' : 
                'destructive'
              }>
                {transfer?.status?.charAt(0).toUpperCase() + transfer?.status?.slice(1)}
              </Badge>
            </div>
            
            {/* Team Transfer Details */}
            <div className="bg-muted p-4 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <p className="font-medium">{fromTeam?.team_name || 'No Team'}</p>
                  <p className="text-sm text-muted-foreground">{fromTeam?.club?.name || 'No Club'}</p>
                </div>
                
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                
                <div className="space-y-1 text-right">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <p className="font-medium">{toTeam?.team_name || 'No Team'}</p>
                  <p className="text-sm text-muted-foreground">{toTeam?.club?.name || 'No Club'}</p>
                </div>
              </div>
              
              {transfer?.reason && (
                <div className="pt-2 border-t border-border">
                  <Label className="text-xs text-muted-foreground">Reason</Label>
                  <p className="text-sm">{transfer.reason}</p>
                </div>
              )}
            </div>
            
            {/* Player Stats Summary */}
            {playerStats && (
              <div className="space-y-2">
                <h4 className="font-medium">Player Stats</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Games</p>
                    <p className="text-lg font-semibold">{playerStats.games_played || 0}</p>
                  </div>
                  <div className="bg-muted rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Goals</p>
                    <p className="text-lg font-semibold">{playerStats.goals || 0}</p>
                  </div>
                  <div className="bg-muted rounded-md p-2">
                    <p className="text-xs text-muted-foreground">Assists</p>
                    <p className="text-lg font-semibold">{playerStats.assists || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleApproval(false)}
            disabled={saving || loading || transfer?.status !== 'pending'}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
            Reject Transfer
          </Button>
          <Button
            onClick={() => handleApproval(true)}
            disabled={saving || loading || transfer?.status !== 'pending'}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            Approve Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
