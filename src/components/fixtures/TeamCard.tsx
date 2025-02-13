
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FixtureFormData } from "./schemas/fixtureFormSchema";

interface TeamCardProps {
  index: number;
  form: UseFormReturn<FixtureFormData>;
  players?: any[];
  getScoreLabel: (isHomeScore: boolean, teamIndex: number) => string;
  getMotmLabel: (teamIndex: number) => string;
}

export const TeamCard = ({
  index,
  form,
  players,
  getScoreLabel,
  getMotmLabel,
}: TeamCardProps) => {
  const isHome = form.watch('is_home');
  const opponent = form.watch('opponent');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team {index + 1}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Our Team Score */}
          <FormField
            control={form.control}
            name={`home_score`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`Team ${index + 1} Score`}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Opponent Score */}
          <FormField
            control={form.control}
            name={`away_score`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`${opponent} Score`}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`team_times.${index}.performance_category`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performance Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MESSI">Messi</SelectItem>
                    <SelectItem value="RONALDO">Ronaldo</SelectItem>
                    <SelectItem value="JAGS">Jags</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {players && (
          <FormField
            control={form.control}
            name={`motm_player_ids.${index}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getMotmLabel(index)}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};
