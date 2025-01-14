import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";

const formSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  location: z.string().optional(),
  category: z.enum(["Ronaldo", "Messi", "Jags"]),  // Changed to match database values
  home_score: z.string().optional(),
  away_score: z.string().optional(),
  motm_player_id: z.string().optional(),
  time: z.string().optional(),
});

export const AddFixtureDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedDate,
  onSuccess,
  editingFixture 
}: AddFixtureDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: editingFixture?.opponent || "",
      location: editingFixture?.location || "",
      category: (editingFixture?.category || "Ronaldo") as "Ronaldo" | "Messi" | "Jags",
      home_score: editingFixture?.home_score?.toString() || "",
      away_score: editingFixture?.away_score?.toString() || "",
      motm_player_id: editingFixture?.motm_player_id || undefined,
      time: editingFixture?.time || "",
    },
  });

  // Query for players based on current category
  const { data: players } = useQuery({
    queryKey: ["players", form.watch("category")],
    queryFn: async () => {
      const category = form.watch("category").toUpperCase(); // Convert to uppercase for player query
      console.log("Fetching players for category:", category);
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("player_category", category)
        .order('name');
      
      if (error) {
        console.error("Error fetching players:", error);
        throw error;
      }
      console.log("Players fetched:", data);
      return data || [];
    },
    enabled: isOpen, // Only run query when dialog is open
  });

  useEffect(() => {
    if (editingFixture) {
      form.reset({
        opponent: editingFixture.opponent,
        location: editingFixture.location || "",
        category: (editingFixture.category?.toUpperCase() as "RONALDO" | "MESSI" | "JAGS"),
        home_score: editingFixture.home_score?.toString() || "",
        away_score: editingFixture.away_score?.toString() || "",
        motm_player_id: editingFixture.motm_player_id || undefined,
        time: editingFixture.time || "",
      });
    }
  }, [editingFixture, form]);

  // Reset MOTM and refetch players when category changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "category") {
        // Reset MOTM when category changes
        form.setValue("motm_player_id", undefined);
        // Refetch players for the new category
        queryClient.invalidateQueries({ queryKey: ["players", value.category] });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, queryClient]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!selectedDate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date",
        });
        return;
      }

      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        category: data.category, // This will now be in correct case (Ronaldo/Messi/Jags)
        date: format(selectedDate, "yyyy-MM-dd"),
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
        motm_player_id: data.motm_player_id || null,
        time: data.time || null,
      };

      if (editingFixture) {
        const { error } = await supabase
          .from("fixtures")
          .update(fixtureData)
          .eq("id", editingFixture.id);
          
        if (error) throw error;
        setShowTeamSelection(true);
      } else {
        const { data: newFixture, error } = await supabase
          .from("fixtures")
          .insert([fixtureData])
          .select()
          .single();
          
        if (error) throw error;
        if (newFixture) {
          setShowTeamSelection(true);
        }
      }

      onSuccess();
      if (!showTeamSelection) {
        form.reset();
        onOpenChange(false);
      }
      toast({
        title: "Success",
        description: editingFixture 
          ? "Fixture updated successfully" 
          : "Fixture added successfully",
      });
    } catch (error) {
      console.error("Error saving fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save fixture",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
        </DialogHeader>
        
        {!showTeamSelection ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ronaldo">Ronaldo</SelectItem>
                        <SelectItem value="Messi">Messi</SelectItem>
                        <SelectItem value="Jags">Jags</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="opponent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opponent</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (optional)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="home_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puma Score</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="away_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opponent Score</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="motm_player_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Man of the Match</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {players?.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} (#{player.squad_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">
                {editingFixture ? "Save Changes" : "Add Fixture"}
              </Button>
            </form>
          </Form>
        ) : (
          <TeamSelectionManager 
            fixtureId={editingFixture?.id || ""} 
            category={form.getValues("category")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
