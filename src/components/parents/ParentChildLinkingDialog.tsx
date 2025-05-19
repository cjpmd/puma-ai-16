
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";

const linkingSchema = z.object({
  playerId: z.string().min(1, "Player selection is required"),
});

interface LinkingFormValues {
  playerId: string;
}

export const ParentChildLinkingDialog = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  const form = useForm<LinkingFormValues>({
    resolver: zodResolver(linkingSchema),
    defaultValues: {
      playerId: "",
    },
  });

  const fetchAvailablePlayers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("players")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          description: "Failed to load available players",
        });
      } else {
        // Use the player data structure that matches your Player type
        setAvailablePlayers(
          data.map((player) => ({
            id: player.id,
            name: player.name,
          })) as Player[]
        );
      }
    } catch (e) {
      console.error("Exception fetching players:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailablePlayers();
    }
  }, [open]);

  const onSubmit = async (values: LinkingFormValues) => {
    if (!profile) {
      toast({
        variant: "destructive",
        description: "You must be logged in to link a child",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("parent_child_linking").insert({
        parent_id: profile.id,
        player_id: values.playerId,
      });

      if (error) {
        console.error("Error linking child:", error);
        toast({
          variant: "destructive",
          description:
            "Failed to link child. They might already be linked to your account.",
        });
        return;
      }

      await refreshProfile();
      toast({
        description: "Child linked successfully to your account!",
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Exception linking child:", error);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Link Child Player</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link Child to Your Account</DialogTitle>
          <DialogDescription>
            Select your child from the list below to link them to your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Player</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a player" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Linking..." : "Link Player"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
