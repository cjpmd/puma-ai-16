import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AddEditCoachDialogProps {
  coach?: {
    id: string;
    name: string;
    email: string;
    role: 'Manager' | 'Coach' | 'Helper';
  };
  trigger?: React.ReactNode;
}

export const AddEditCoachDialog = ({ coach, trigger }: AddEditCoachDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // Fetch available badges
  const { data: availableBadges } = useQuery({
    queryKey: ["coaching-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_badges")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch coach's current badges if editing
  const { data: coachBadges } = useQuery({
    queryKey: ["coach-badges", coach?.id],
    queryFn: async () => {
      if (!coach?.id) return [];
      const { data, error } = await supabase
        .from("coach_badges")
        .select("badge_id")
        .eq("coach_id", coach.id);
      if (error) throw error;
      return data.map(cb => cb.badge_id);
    },
    enabled: !!coach?.id,
  });

  const form = useForm({
    defaultValues: {
      name: coach?.name || "",
      email: coach?.email || "",
      role: coach?.role || "Coach",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      if (coach) {
        // Update existing coach
        const { error: updateError } = await supabase
          .from("coaches")
          .update({
            name: values.name,
            email: values.email,
            role: values.role,
          })
          .eq("id", coach.id);

        if (updateError) throw updateError;

        // Update badges
        // First, remove all existing badges
        await supabase
          .from("coach_badges")
          .delete()
          .eq("coach_id", coach.id);

        // Then add selected badges
        if (selectedBadges.length > 0) {
          const { error: badgeError } = await supabase
            .from("coach_badges")
            .insert(
              selectedBadges.map(badgeId => ({
                coach_id: coach.id,
                badge_id: badgeId,
              }))
            );

          if (badgeError) throw badgeError;
        }

        toast({
          description: "Coach updated successfully",
        });
      } else {
        // Add new coach
        const { data: newCoach, error } = await supabase
          .from("coaches")
          .insert([{
            name: values.name,
            email: values.email,
            role: values.role,
          }])
          .select()
          .single();

        if (error) throw error;

        // Add selected badges for new coach
        if (selectedBadges.length > 0 && newCoach) {
          const { error: badgeError } = await supabase
            .from("coach_badges")
            .insert(
              selectedBadges.map(badgeId => ({
                coach_id: newCoach.id,
                badge_id: badgeId,
              }))
            );

          if (badgeError) throw badgeError;
        }

        toast({
          description: "Coach added successfully",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setOpen(false);
    } catch (error) {
      console.error("Error saving coach:", error);
      toast({
        variant: "destructive",
        description: "Failed to save coach",
      });
    }
  };

  // Initialize selected badges when coach badges are loaded
  useState(() => {
    if (coachBadges) {
      setSelectedBadges(coachBadges);
    }
  });

  const toggleBadge = (badgeId: string) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Coach</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{coach ? "Edit Coach" : "Add New Coach"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Helper">Helper</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Coaching Badges</FormLabel>
              <div className="flex flex-wrap gap-2">
                {availableBadges?.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center space-x-2 border rounded-lg p-2"
                  >
                    <Checkbox
                      id={badge.id}
                      checked={selectedBadges.includes(badge.id)}
                      onCheckedChange={() => toggleBadge(badge.id)}
                    />
                    <label
                      htmlFor={badge.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {badge.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit">{coach ? "Save Changes" : "Add Coach"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};