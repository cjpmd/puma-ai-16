import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamSelectionManager } from "../TeamSelectionManager";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Database } from "@/integrations/supabase/types";

type Festival = Database["public"]["Tables"]["festivals"]["Insert"];

const formSchema = z.object({
  location: z.string().optional(),
  time: z.string().optional(),
  format: z.enum(["4-a-side", "5-a-side", "7-a-side", "9-a-side", "11-a-side"]),
  numberOfTeams: z.coerce.number().min(2, "At least 2 teams required"),
});

type FormData = z.infer<typeof formSchema>;

interface AddFestivalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
}

export const AddFestivalDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onSuccess,
}: AddFestivalDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [festivalId, setFestivalId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Array<{ id: string; name: string; category: string }>>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      format: "7-a-side",
      numberOfTeams: 2,
      location: "",
      time: "",
    },
  });

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

      const festivalData: Festival = {
        date: format(selectedDate, "yyyy-MM-dd"),
        time: data.time || null,
        location: data.location || null,
        format: data.format,
        number_of_teams: data.numberOfTeams,
        system_category: "FESTIVAL",
      };

      const { data: festival, error } = await supabase
        .from("festivals")
        .insert(festivalData)
        .select()
        .single();

      if (error) throw error;

      // Create empty teams
      const teamPromises = Array.from({ length: data.numberOfTeams }, (_, i) => 
        supabase
          .from("festival_teams")
          .insert({
            festival_id: festival.id,
            team_name: `Team ${i + 1}`,
          })
          .select()
      );

      const teamResults = await Promise.all(teamPromises);
      const createdTeams = teamResults
        .map(result => result.data?.[0])
        .filter((team): team is NonNullable<typeof team> => team !== null)
        .map(team => ({
          id: team.id,
          name: team.team_name,
          category: team.category || "",
        }));

      setTeams(createdTeams);
      setFestivalId(festival.id);
      setShowTeamSelection(true);

      toast({
        title: "Success",
        description: "Festival created successfully",
      });

      if (!showTeamSelection) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error saving festival:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save festival",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add New Festival</DialogTitle>
          <DialogDescription>
            Fill in the festival details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {!showTeamSelection ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="numberOfTeams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Teams *</FormLabel>
                    <FormControl>
                      <Input type="number" min="2" {...field} />
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

              <Button type="submit" className="w-full">
                Continue to Team Selection
              </Button>
            </form>
          </Form>
        ) : (
          <TeamSelectionManager
            teams={teams}
            format={form.getValues("format")}
            onTeamSelectionsChange={(selections) => {
              console.log("Team selections:", selections);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};