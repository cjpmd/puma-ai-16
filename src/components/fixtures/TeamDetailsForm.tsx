
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FixtureFormData } from "./schemas/fixtureFormSchema";

interface TeamDetailsFormProps {
  form: UseFormReturn<FixtureFormData>;
}

export const TeamDetailsForm = ({ form }: TeamDetailsFormProps) => {
  return (
    <>
      <div className="text-lg font-semibold mb-2">Team: Broughty Pumas 2015s</div>
      
      <div className="grid grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="is_home"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Location</FormLabel>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={field.value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => field.onChange(true)}
                >
                  Home
                </Button>
                <Button
                  type="button"
                  variant={!field.value ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => field.onChange(false)}
                >
                  Away
                </Button>
              </div>
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
