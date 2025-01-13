import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

const formSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  location: z.string().optional(),
  category: z.enum(["Ronaldo", "Messi", "Jags"]),
  home_score: z.string().optional(),
  away_score: z.string().optional(),
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
  } | null;
}

export const AddFixtureDialog = ({ 
  isOpen, 
  onOpenChange, 
  selectedDate,
  onSuccess,
  editingFixture 
}: AddFixtureDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: editingFixture?.opponent || "",
      location: editingFixture?.location || "",
      category: (editingFixture?.category as "Ronaldo" | "Messi" | "Jags") || "Ronaldo",
      home_score: editingFixture?.home_score?.toString() || "",
      away_score: editingFixture?.away_score?.toString() || "",
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

      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        category: data.category,
        date: format(selectedDate, "yyyy-MM-dd"),
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
      };

      if (editingFixture) {
        await supabase
          .from("fixtures")
          .update(fixtureData)
          .eq("id", editingFixture.id);
      } else {
        await supabase.from("fixtures").insert([fixtureData]);
      }

      onSuccess();
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: editingFixture 
          ? "Fixture updated successfully" 
          : "Fixture added successfully",
      });
    } catch (error) {
      console.error("Error adding fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save fixture",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
        </DialogHeader>
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
                    defaultValue={field.value}
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
            <Button type="submit" className="w-full">
              {editingFixture ? "Save Changes" : "Add Fixture"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};