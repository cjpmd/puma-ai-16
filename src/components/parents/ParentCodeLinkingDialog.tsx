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
import { createPlayerParentsTable } from "@/utils/database/createTables";

export const ParentCodeLinkingDialog = () => {
  const [open, setOpen] = useState(false);
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
      console.log("Linking parent with code:", linkingCode);
      
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
      
      // Ensure player_parents table exists
      const tableCreated = await createPlayerParentsTable();
      if (!tableCreated) {
        toast.error("Failed to set up parent-child linking. Please contact an administrator.");
        return;
      }
      
      // Look for existing parent link
      const { data: existingLinks, error: linkError } = await supabase
        .from("player_parents")
        .select("*")
        .match({
          player_id: player.id,
          parent_id: profile?.id
        })
        .limit(1);
      
      if (linkError) throw linkError;
      
      if (existingLinks && existingLinks.length > 0) {
        toast.error("You are already linked to this player");
        return;
      }
      
      // Create parent-child link
      const { error: insertError } = await supabase
        .from("player_parents")
        .insert({
          player_id: player.id,
          parent_id: profile?.id,
          parent_name: profile?.name || profile?.email,
          email: profile?.email,
          is_verified: true
        });
      
      if (insertError) throw insertError;
      
      // Clear the linking code after use
      const { error: updateError } = await supabase
        .from("players")
        .update({
          linking_code: null
        })
        .eq("id", player.id);
      
      if (updateError) {
        console.warn("Could not clear linking code after use:", updateError);
      }
      
      // Success - close dialog and show toast
      toast.success("Successfully linked to child's account!");
      await refreshProfile();
      setOpen(false);
      setLinkingCode("");
    } catch (error: any) {
      console.error("Error linking parent:", error);
      toast.error(error.message || "An error occurred while linking accounts");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Link Child Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Child Account</DialogTitle>
          <DialogDescription>
            Enter the linking code provided by your child's coach to connect your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="linkingCode">Child Linking Code</Label>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
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
