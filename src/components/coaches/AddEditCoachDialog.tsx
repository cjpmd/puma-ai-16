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
import { useQueryClient } from "@tanstack/react-query";

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
        const { error } = await supabase
          .from("coaches")
          .update({
            name: values.name,
            email: values.email,
            role: values.role,
          })
          .eq("id", coach.id);

        if (error) throw error;

        toast({
          description: "Coach updated successfully",
        });
      } else {
        // Add new coach
        const { error } = await supabase
          .from("coaches")
          .insert([{
            name: values.name,
            email: values.email,
            role: values.role,
          }]);

        if (error) throw error;

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

            <Button type="submit">{coach ? "Save Changes" : "Add Coach"}</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};