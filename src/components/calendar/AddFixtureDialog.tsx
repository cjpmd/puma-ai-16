import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface AddFixtureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess: () => void;
  editFixture?: {
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
  };
}

interface FixtureForm {
  opponent: string;
  homeScore?: number;
  awayScore?: number;
}

export const AddFixtureDialog = ({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
  editFixture,
}: AddFixtureDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FixtureForm>();

  useEffect(() => {
    if (editFixture) {
      form.reset({
        opponent: editFixture.opponent,
        homeScore: editFixture.home_score || undefined,
        awayScore: editFixture.away_score || undefined,
      });
    } else {
      form.reset({
        opponent: "",
        homeScore: undefined,
        awayScore: undefined,
      });
    }
  }, [editFixture, form]);

  const onSubmit = async (data: FixtureForm) => {
    if (!selectedDate && !editFixture) return;

    setIsLoading(true);
    
    if (editFixture) {
      const { error } = await supabase
        .from("fixtures")
        .update({
          opponent: data.opponent,
          home_score: data.homeScore || null,
          away_score: data.awayScore || null,
        })
        .eq("id", editFixture.id);

      setIsLoading(false);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update fixture. Please try again.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Fixture has been updated.",
      });
    } else {
      const { error } = await supabase.from("fixtures").insert({
        date: format(selectedDate!, "yyyy-MM-dd"),
        opponent: data.opponent,
        home_score: data.homeScore || null,
        away_score: data.awayScore || null,
      });

      setIsLoading(false);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create fixture. Please try again.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Fixture has been created.",
      });
    }

    form.reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editFixture ? "Edit Fixture" : "Add New Fixture"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="opponent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opponent</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter opponent name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homeScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="awayScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Away Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {editFixture ? "Update Fixture" : "Add Fixture"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};