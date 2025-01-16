import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Check } from "lucide-react";

interface EditObjectiveDialogProps {
  objective: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditObjectiveDialog = ({ 
  objective, 
  isOpen, 
  onOpenChange,
  onSuccess 
}: EditObjectiveDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      title: objective.title,
      description: objective.description,
      status: objective.status,
      points: objective.points,
      review_date: objective.review_date,
    },
  });

  const onSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("player_objectives")
        .update({
          title: values.title,
          description: values.description,
          status: values.status,
          points: values.points,
          review_date: values.review_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", objective.id);

      if (error) throw error;

      toast({
        description: "Objective updated successfully",
      });
      
      onSuccess();
      setTimeout(() => {
        setIsSaving(false);
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating objective:", error);
      toast({
        variant: "destructive",
        description: "Failed to update objective",
      });
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Objective</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="IMPROVING">Improving</SelectItem>
                      <SelectItem value="COMPLETE">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="review_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className={`w-full transition-all ${isSaving ? 'bg-green-500 hover:bg-green-600' : ''}`}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};