import { useState } from "react";
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
}: AddFixtureDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FixtureForm>();

  const onSubmit = async (data: FixtureForm) => {
    if (!selectedDate) return;

    setIsLoading(true);
    const { error } = await supabase.from("fixtures").insert({
      date: format(selectedDate, "yyyy-MM-dd"),
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
    form.reset();
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Fixture</DialogTitle>
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
              Add Fixture
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};