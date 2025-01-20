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
  DialogDescription,
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
import { Trophy, Minus, XCircle } from "lucide-react";

const formSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  location: z.string().optional(),
  category: z.enum(["Ronaldo", "Messi", "Jags"]),
  home_score: z.string().optional(),
  away_score: z.string().optional(),
  motm_player_id: z.string().optional(),
  time: z.string().optional(),
  format: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddFixtureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editingFixture?: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
    category?: string;
    location?: string;
    motm_player_id?: string | null;
    time?: string | null;
    format?: string | null;
  } | null;
  showDateSelector?: boolean;
}

export const AddFixtureDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedDate: initialSelectedDate,
  onSuccess,
  editingFixture,
  showDateSelector = false
}: AddFixtureDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialSelectedDate);
  
  // Fetch default format from team settings
  const { data: teamSettings } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_settings")
        .select("format")
        .single();

      if (error) throw error;
      return data;
    },
  });

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
      format: editingFixture?.format || teamSettings?.format || "7-a-side",
    },
  });

  // Update form when team settings are loaded
  useEffect(() => {
    if (teamSettings?.format && !editingFixture?.format) {
      form.setValue("format", teamSettings.format);
    }
  }, [teamSettings, form, editingFixture]);

  const { data: players } = useQuery({
    queryKey: ["players", form.getValues("category")],
    queryFn: async () => {
      const category = form.getValues("category").toUpperCase();
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
    enabled: isOpen,
  });

  useEffect(() => {
    if (editingFixture) {
      form.reset({
        opponent: editingFixture.opponent,
        location: editingFixture.location || "",
        category: (editingFixture.category || "Ronaldo") as "Ronaldo" | "Messi" | "Jags",
        home_score: editingFixture.home_score?.toString() || "",
        away_score: editingFixture.away_score?.toString() || "",
        motm_player_id: editingFixture.motm_player_id || undefined,
        time: editingFixture.time || "",
        format: editingFixture.format || teamSettings?.format || "7-a-side",
      });
    }
  }, [editingFixture, form, teamSettings]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "category") {
        form.setValue("motm_player_id", undefined);
        queryClient.invalidateQueries({ queryKey: ["players", value.category] });
      }
    });
    return () => subscription.unsubscribe();
  }, [form, queryClient]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (!selectedDate) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a date",
        });
        return;
      }

      let outcome: string | null = null;
      if (data.home_score && data.away_score) {
        const homeScore = parseInt(data.home_score);
        const awayScore = parseInt(data.away_score);
        if (homeScore > awayScore) {
          outcome = 'WIN';
        } else if (homeScore === awayScore) {
          outcome = 'DRAW';
        } else {
          outcome = 'LOSS';
        }
      }

      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        category: data.category,
        date: format(selectedDate, "yyyy-MM-dd"),
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
        motm_player_id: data.motm_player_id || null,
        time: data.time || null,
        outcome,
        format: data.format,
      };

      let newFixture;
      
      if (editingFixture) {
        const { error } = await supabase
          .from("fixtures")
          .update(fixtureData)
          .eq("id", editingFixture.id);
          
        if (error) throw error;
        newFixture = { ...editingFixture, ...fixtureData };
      } else {
        const { data: insertedFixture, error } = await supabase
          .from("fixtures")
          .insert([fixtureData])
          .select()
          .single();
          
        if (error) throw error;
        newFixture = insertedFixture;

        // Send WhatsApp notification for new fixtures
        try {
          const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              type: 'FIXTURE',
              date: format(selectedDate, "dd/MM/yyyy"),
              time: data.time,
              opponent: data.opponent,
              location: data.location,
              category: data.category
            }
          });

          if (notificationError) {
            console.error('Error sending WhatsApp notification:', notificationError);
            toast({
              title: "Warning",
              description: "Fixture created but there was an error sending notifications",
              variant: "destructive",
            });
          }
        } catch (notificationError) {
          console.error('Error invoking WhatsApp notification function:', notificationError);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
          <DialogDescription>
            Fill in the fixture details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        {!showTeamSelection ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {showDateSelector && (
                <div className="space-y-2">
                  <FormLabel>Date *</FormLabel>
                  <Input 
                    type="date" 
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} 
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined;
                      setSelectedDate(date);
                    }}
                  />
                </div>
              )}
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team *</FormLabel>
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
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="4-a-side">4-a-side</SelectItem>
                        <SelectItem value="5-a-side">5-a-side</SelectItem>
                        <SelectItem value="7-a-side">7-a-side</SelectItem>
                        <SelectItem value="9-a-side">9-a-side</SelectItem>
                        <SelectItem value="11-a-side">11-a-side</SelectItem>
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
                    <FormLabel>Opponent *</FormLabel>
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
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingFixture ? "Save Changes" : "Add Fixture"}
              </Button>
            </form>
          </Form>
        ) : (
          <TeamSelectionManager 
            fixtureId={editingFixture?.id || ""} 
            category={form.getValues("category")}
            format={form.getValues("format")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};