
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface PlayerCodeLinkingDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PlayerCodeLinkingDialog = ({ isOpen, onClose }: PlayerCodeLinkingDialogProps) => {
  const [open, setOpen] = useState(isOpen || false);
  const [linkingCode, setLinkingCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile, refreshProfile } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkingCode.trim()) {
      toast.error("Please enter a valid linking code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Linking player with code:", linkingCode);
      
      // First, look up the player with this linking code
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("linking_code", linkingCode.trim())
        .limit(1);
      
      if (playersError) throw playersError;
      
      if (!players || players.length === 0) {
        toast.error("Invalid linking code. Please check the code and try again.");
        return;
      }
      
      const player = players[0];
      console.log("Found player:", player);
      
      // Check if player already linked to another user
      if (player.user_id && player.user_id !== profile?.id) {
        toast.error("This player is already linked to another account");
        return;
      }
      
      // Check if player.self_linked exists and if true, prevent linking
      if (player.self_linked) {
        toast.error("This player account has already been linked");
        return;
      }
      
      // Update the player record to link to this user
      const { error: updateError } = await supabase
        .from("players")
        .update({
          user_id: profile?.id,
          self_linked: true,
          linking_code: null, // Clear the linking code after use
        })
        .eq("id", player.id);
      
      if (updateError) throw updateError;
      
      // Success - close dialog and show toast
      toast.success("Successfully linked to player account!");
      await refreshProfile();
      
      if (onClose) {
        onClose();
      } else {
        setOpen(false);
      }
      
      setLinkingCode("");
    } catch (error: any) {
      console.error("Error linking player:", error);
      toast.error(error.message || "An error occurred while linking player account");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Link Player Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Player Account</DialogTitle>
          <DialogDescription>
            Enter the player linking code provided by your coach to connect your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="linkingCode">Player Linking Code</Label>
              <Input
                id="linkingCode"
                value={linkingCode}
                onChange={(e) => setLinkingCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose ? onClose() : setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Link Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
