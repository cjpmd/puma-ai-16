
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth.tsx"; // Fixed import to .tsx extension

export const ParentCodeLinkingDialog = () => {
  const [open, setOpen] = useState(false);
  const [linkingCode, setLinkingCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const { profile, refreshProfile } = auth;

  const handleLinkWithCode = async () => {
    if (!linkingCode || !profile) {
      toast({
        title: "Error",
        description: "Please enter a valid linking code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the player with this linking code
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("id, name")
        .eq("linking_code", linkingCode)
        .single();

      if (playerError || !playerData) {
        toast({
          title: "Invalid Code",
          description: "No player found with this linking code",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create link between parent and child
      const { error } = await supabase
        .from("parent_child_linking")
        .insert({
          parent_id: profile.id,
          player_id: playerData.id,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already linked",
            description: "This player is already linked to your account",
            variant: "destructive", // Changed from "warning" to "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
        return;
      }

      // Update role to include parent role if needed
      if (profile && refreshProfile && auth.addRole) {
        await auth.addRole("parent");
        await refreshProfile();
      }

      toast({
        title: "Success",
        description: `Linked to player: ${playerData.name}`,
      });
      
      setLinkingCode("");
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Link Player with Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link with Player Code</DialogTitle>
          <DialogDescription>
            Enter the linking code provided by the coach or player to connect your parent account
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkingCode" className="col-span-4">
              Linking Code
            </Label>
            <Input
              id="linkingCode"
              value={linkingCode}
              onChange={(e) => setLinkingCode(e.target.value)}
              placeholder="Enter code (e.g., ABC123)"
              className="col-span-4"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleLinkWithCode} disabled={isSubmitting}>
            {isSubmitting ? "Linking..." : "Link Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParentCodeLinkingDialog;
