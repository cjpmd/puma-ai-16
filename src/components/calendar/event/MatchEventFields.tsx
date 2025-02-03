import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface MatchEventFieldsProps {
  form: UseFormReturn<any>;
}

export const MatchEventFields = ({ form }: MatchEventFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="opponent"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Opponent</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter opponent name" />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isHome"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Home Game</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};