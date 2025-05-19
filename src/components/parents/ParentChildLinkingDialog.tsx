
// Replace the existing content with fixed code that properly handles useAuth
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const ParentChildLinkingDialog = () => {
  const [open, setOpen] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);
  const { toast } = useToast();
  const auth = useAuth();
  const { profile, refreshProfile } = auth;

  useEffect(() => {
    if (open && profile) {
      loadLinkedChildren();
    }
  }, [open, profile]);

  const loadLinkedChildren = async () => {
    if (!profile) return;
    
    try {
      // Fetch linked children data
      const { data, error } = await supabase
        .from("parent_child_linking")
        .select(`
          player_id,
          players:player_id (
            id, 
            name
          )
        `)
        .eq("parent_id", profile.id);

      if (error) {
        throw error;
      }

      setLinkedChildren(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading linked children",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLinkPlayer = async () => {
    if (!playerId || !profile) {
      toast({
        title: "Error",
        description: "Please enter a valid player ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if player exists
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("id, name")
        .eq("id", playerId)
        .single();

      if (playerError || !playerData) {
        toast({
          title: "Error",
          description: "Player not found with this ID",
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
          player_id: playerId,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already linked",
            description: "This player is already linked to your account",
            variant: "warning",
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

      // Reload linked children
      await loadLinkedChildren();
      
      toast({
        title: "Success",
        description: `Linked to player: ${playerData.name}`,
      });
      
      setPlayerId("");
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
        <Button variant="outline">Link to Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link to Player Account</DialogTitle>
          <DialogDescription>
            Enter the player's ID to link them to your parent account
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="playerId" className="col-span-4">
              Player ID
            </Label>
            <Input
              id="playerId"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              placeholder="Enter player UUID"
              className="col-span-4"
            />
          </div>

          {linkedChildren.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Currently Linked Players:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {linkedChildren.map((link) => (
                  <li key={link.player_id} className="text-sm">
                    {link.players?.name || "Unknown Player"} 
                    <span className="text-xs text-gray-400 ml-1">
                      ({link.player_id})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleLinkPlayer} disabled={isSubmitting}>
            {isSubmitting ? "Linking..." : "Link Player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParentChildLinkingDialog;
