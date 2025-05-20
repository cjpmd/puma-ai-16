
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth.tsx";
import { supabase } from "@/integrations/supabase/client";
import { Check, Loader2 } from "lucide-react";

export const ParentChildLinkingDialog = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleLinkChild = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to link a child.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Lookup the player with this code
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id, name')
        .eq('linking_code', code)
        .single();
      
      if (playerError) {
        throw new Error("Invalid code. Please check and try again.");
      }
      
      // Link the parent to the child
      const { error: linkError } = await supabase
        .from('parent_child_linking')
        .insert({
          parent_id: profile.id,
          player_id: playerData.id
        });
      
      if (linkError) {
        // Check if it's a duplicate link
        if (linkError.code === '23505') { // Unique constraint violation
          throw new Error("You are already linked to this player.");
        }
        throw new Error("Failed to link to player. Please try again.");
      }
      
      setSuccess(true);
      toast({
        title: "Success!",
        description: `You are now linked to player: ${playerData.name}`,
      });
      
      // Reset form after a delay
      setTimeout(() => {
        setSuccess(false);
        setCode("");
        setOpen(false);
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Link to Child</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link to Child Player</DialogTitle>
          <DialogDescription>
            Enter the linking code provided by your child's coach to connect your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3"
              placeholder="Enter linking code"
              disabled={loading || success}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleLinkChild} 
            disabled={!code || loading || success}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success && <Check className="mr-2 h-4 w-4" />}
            {success ? "Linked Successfully" : "Link to Child"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
