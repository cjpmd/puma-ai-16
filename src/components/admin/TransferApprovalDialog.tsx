
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { approveTransfer } from "@/utils/database/transferSystem";

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
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  
  if (!transfer) {
    return null;
  }

  const handleApprove = async () => {
    setApproving(true);
    try {
      const success = await approveTransfer(transfer.id);
      
      if (success) {
        toast.success("Transfer approved successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error("Failed to approve transfer");
      }
    } catch (error) {
      console.error("Error approving transfer:", error);
      toast.error("An error occurred while approving the transfer");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      // Update the transfer status to 'rejected'
      const { error } = await supabase
        .from('player_transfers')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', transfer.id);
      
      if (error) throw error;
      
      toast.success("Transfer rejected");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error rejecting transfer:", error);
      toast.error("An error occurred while rejecting the transfer");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Approval</DialogTitle>
          <DialogDescription>
            Review and approve or reject this player transfer
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar>
              {transfer.player?.profile_image ? (
                <AvatarImage src={transfer.player.profile_image} alt={transfer.player?.name} />
              ) : (
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-medium">{transfer.player?.name || "Unknown Player"}</h3>
              <p className="text-sm text-muted-foreground">
                {transfer.type === 'transfer' ? 'Transfer Request' : 'Player Leaving'}
              </p>
            </div>
          </div>
          
          {transfer.type === 'transfer' && (
            <div className="bg-muted p-3 rounded-md grid grid-cols-3 gap-2 items-center">
              <div className="text-sm">
                <p className="font-medium">{transfer.from_team?.team_name || "Current Team"}</p>
                <p className="text-xs text-muted-foreground">From</p>
              </div>
              <div className="flex justify-center">
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-sm text-right">
                <p className="font-medium">{transfer.to_team?.team_name || "New Team"}</p>
                <p className="text-xs text-muted-foreground">To</p>
              </div>
            </div>
          )}
          
          {transfer.type === 'leave' && (
            <div className="bg-muted p-3 rounded-md">
              <Badge variant="destructive" className="mb-1">Player Leaving</Badge>
              <p className="text-sm">
                Player is leaving {transfer.from_team?.team_name || "their current team"}
              </p>
            </div>
          )}
          
          {transfer.reason && (
            <div>
              <label className="text-sm font-medium">Reason:</label>
              <p className="text-sm text-muted-foreground mt-1 p-2 border rounded-md">
                {transfer.reason}
              </p>
            </div>
          )}
          
          <div>
            <p className="text-xs text-muted-foreground">
              Requested on {new Date(transfer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={approving || rejecting}
          >
            Cancel
          </Button>
          
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={approving || rejecting}
          >
            {rejecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Reject
          </Button>
          
          <Button 
            onClick={handleApprove}
            disabled={approving || rejecting || transfer.type === 'leave'}
          >
            {approving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
