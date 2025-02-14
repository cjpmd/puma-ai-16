
import { Card, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamCardProps {
  index: number;
  form: any;
  players?: any[];
  getScoreLabel: (isHomeScore: boolean, teamIndex: number) => string;
  getMotmLabel: (teamIndex: number) => string;
}

export const TeamCard = ({
  index,
  form,
  players,
  getScoreLabel,
  getMotmLabel
}: TeamCardProps) => {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Performance Category */}
          <FormField
            control={form.control}
            name={`team_times.${index}.performance_category`}
            defaultValue="MESSI"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performance Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select performance category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MESSI">Messi</SelectItem>
                    <SelectItem value="RONALDO">Ronaldo</SelectItem>
                    <SelectItem value="JAGS">Jags</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Team Score */}
          <FormField
            control={form.control}
            name={`team_${index + 1}_score`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getScoreLabel(true, index)}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Opponent Score */}
          <FormField
            control={form.control}
            name={`opponent_${index + 1}_score`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getScoreLabel(false, index)}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Meeting Time */}
          <FormField
            control={form.control}
            name={`team_times.${index}.meeting_time`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Start Time */}
          <FormField
            control={form.control}
            name={`team_times.${index}.start_time`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* End Time */}
          <FormField
            control={form.control}
            name={`team_times.${index}.end_time`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Player of the Match */}
          {players && (
            <FormField
              control={form.control}
              name={`motm_player_ids.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getMotmLabel(index)}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
                </FormItem>
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
