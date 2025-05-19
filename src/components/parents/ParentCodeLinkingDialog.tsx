
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParentCodeLinkingDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ParentCodeLinkingDialog = ({ isOpen, onClose }: ParentCodeLinkingDialogProps) => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [playerId, setPlayerId] = useState("");
  const [open, setOpen] = useState(isOpen || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When linking a parent, use the right field names
  const handleLinkParent = async () => {
    if (!playerId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid player ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Fix the field names when inserting into player_parents
      const { data, error } = await supabase
        .from("player_parents")
        .insert({
          player_id: playerId,
          name: profile?.name || "",
          email: profile?.email || "",
          is_verified: true
        });

      if (error) {
        console.error("Error linking parent:", error);
        toast({
          title: "Error",
          description: "Failed to link parent. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Parent linked successfully!",
      });
      
      if (onClose) {
        onClose();
      } else {
        setOpen(false);
      }
      
      // After linking, refresh the profile
      await refreshProfile();
    } catch (error) {
      console.error("Unexpected error linking parent:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose ? onClose : setOpen}>
      <DialogTrigger asChild>
        <Button>Link to Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Player to Parent Account</DialogTitle>
          <DialogDescription>
            Enter the player ID to link this parent account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player_id" className="text-right">
              Player ID
            </Label>
            <Input
              type="text"
              id="player_id"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleLinkParent} disabled={isSubmitting}>
          {isSubmitting ? "Linking..." : "Link Parent"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
