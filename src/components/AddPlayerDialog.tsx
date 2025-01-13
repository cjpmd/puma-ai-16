import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerCategory, PlayerType } from "@/types/player";
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
import { differenceInYears } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { 
  GOALKEEPER_ATTRIBUTES, 
  TECHNICAL_ATTRIBUTES, 
  MENTAL_ATTRIBUTES, 
  PHYSICAL_ATTRIBUTES 
} from "@/constants/attributes";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  squadNumber: z.string().min(1, "Squad number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  playerCategory: z.string(),
  playerType: z.string(),
});

export const AddPlayerDialog = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      squadNumber: "",
      dateOfBirth: "",
      playerCategory: "MESSI",
      playerType: "OUTFIELD",
    },
  });

  const onSubmit = async (values: any) => {
    try {
      if (!values.dateOfBirth) {
        toast({
          variant: "destructive",
          description: "Date of birth is required",
        });
        return;
      }

      const { data, error } = await supabase
        .from("players")
        .insert([
          {
            name: values.name,
            squad_number: values.squadNumber,
            date_of_birth: values.dateOfBirth,
            player_category: values.playerCategory,
            player_type: values.playerType,
            age: differenceInYears(new Date(), new Date(values.dateOfBirth)),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add initial attributes based on player type
      const attributes = values.playerType === "GOALKEEPER" 
        ? GOALKEEPER_ATTRIBUTES 
        : [...TECHNICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES, ...PHYSICAL_ATTRIBUTES];

      const { error: attributesError } = await supabase
        .from("player_attributes")
        .insert(
          attributes.map((attr) => ({
            player_id: data.id,
            name: attr.name,
            value: 10,
            category: attr.category,
          }))
        );

      if (attributesError) throw attributesError;

      toast({
        description: "Player added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["players"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        variant: "destructive",
        description: "Failed to add player",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Player</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
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
              name="squadNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Squad Number</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playerCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RONALDO">Ronaldo</SelectItem>
                      <SelectItem value="MESSI">Messi</SelectItem>
                      <SelectItem value="JAGS">Jags</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                      <SelectItem value="OUTFIELD">Outfield</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Add Player</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};