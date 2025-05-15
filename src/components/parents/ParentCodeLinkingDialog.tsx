
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Key, Lock, Shield, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";

const linkCodeSchema = z.object({
  linkingCode: z
    .string()
    .min(4, "Code should be at least 4 characters")
    .max(36, "Code should not exceed 36 characters"),
});

interface Player {
  id: string;
  name: string;
  squad_number: number;
  team_id?: string;
}

export const ParentCodeLinkingDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkedPlayer, setLinkedPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const form = useForm<z.infer<typeof linkCodeSchema>>({
    resolver: zodResolver(linkCodeSchema),
    defaultValues: {
      linkingCode: "",
    },
  });

  const linkPlayerWithCode = async (values: z.infer<typeof linkCodeSchema>) => {
    if (!profile?.id) return;
    
    setIsSubmitting(true);
    try {
      // Step 1: Find player with this linking code
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select(`
          id,
          name,
          squad_number,
          team_id
        `)
        .eq('linking_code', values.linkingCode)
        .maybeSingle();
      
      if (playerError || !playerData) {
        throw new Error("Invalid linking code or player not found");
      }
      
      // Step 2: Check if link already exists
      const { data: existingLink, error: checkError } = await supabase
        .from('player_parents')
        .select('id')
        .eq('player_id', playerData.id)
        .eq('parent_id', profile.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingLink) {
        toast({
          description: "You're already linked to this player",
        });
        setIsOpen(false);
        setIsSubmitting(false);
        return;
      }
      
      // Step 3: Create new link between parent and player
      const { error } = await supabase
        .from('player_parents')
        .insert([
          { 
            player_id: playerData.id, 
            parent_id: profile.id,
            name: profile.email,
            email: profile.email,
            is_verified: true
          }
        ]);
      
      if (error) throw error;
      
      // Set player data
      setLinkedPlayer(playerData);
      
      // Show success message
      toast({
        title: "Success",
        description: `Successfully linked to ${playerData.name}`,
      });
      
      // Wait for the success state to be visible for a moment
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error linking player:', error);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Failed to link to player",
      });
    }
  };

  const handleClose = () => {
    if (linkedPlayer) {
      // If we successfully linked, reload the dashboard
      window.location.reload();
    }
    setIsOpen(false);
    setLinkedPlayer(null);
    form.reset();
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
        <Key className="h-4 w-4" />
        Enter Linking Code
      </Button>
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Your Child</DialogTitle>
            <DialogDescription>
              Enter the player linking code provided by your team administrator
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {!linkedPlayer ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(linkPlayerWithCode)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="linkingCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Linking Code</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter code (e.g., A12BCD)"
                            className="font-mono text-center text-lg tracking-wider"
                          />
                        </FormControl>
                        <FormDescription>
                          Your team administrator can provide you with this code
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="flex items-center mb-2 gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Secure Linking Process</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This process securely links your account to your child's profile, 
                      giving you access to view their information and manage their subscriptions.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Link to Player
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 border border-green-200 rounded-md flex flex-col items-center gap-2">
                  <div className="bg-green-100 rounded-full p-2 mb-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="font-medium text-green-800">Successfully Linked!</p>
                  <p className="text-center text-sm text-green-700">
                    You are now linked to {linkedPlayer.name}
                  </p>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-sm">
                    You can now view your child's information and manage their account from your parent dashboard.
                  </p>
                </div>
                
                <Button onClick={handleClose} className="w-full">
                  Go to Parent Dashboard
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
