import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Fixture } from "@/types/fixture";

const formSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  location: z.string().optional(),
  number_of_teams: z.string().optional(),
  home_score: z.array(z.string().optional()),
  away_score: z.array(z.string().optional()),
  motm_player_ids: z.array(z.string().optional()),
  meeting_time: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_home: z.boolean().default(true),
  format: z.string().default("7-a-side"),
});

type FormData = z.infer<typeof formSchema>;

interface FixtureFormProps {
  onSubmit: (data: FormData) => void;
  selectedDate?: Date;
  editingFixture?: Fixture | null;
  players?: any[];
  isSubmitting?: boolean;
  showDateSelector?: boolean;
}

export const FixtureForm = ({ 
  onSubmit, 
  selectedDate, 
  editingFixture,
  players,
  isSubmitting,
  showDateSelector = false
}: FixtureFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      opponent: editingFixture?.opponent || "",
      location: editingFixture?.location || "",
      number_of_teams: editingFixture?.number_of_teams?.toString() || "1",
      format: editingFixture?.format || "7-a-side",
      home_score: Array(editingFixture?.number_of_teams || 1).fill(""),
      away_score: Array(editingFixture?.number_of_teams || 1).fill(""),
      motm_player_ids: Array(editingFixture?.number_of_teams || 1).fill(""),
      meeting_time: editingFixture?.meeting_time || "",
      start_time: editingFixture?.start_time || "",
      end_time: editingFixture?.end_time || "",
      is_home: editingFixture?.is_home ?? true,
    },
  });

  const watchNumberOfTeams = parseInt(form.watch("number_of_teams") || "1");
  const watchOpponent = form.watch("opponent");
  const watchIsHome = form.watch("is_home");

  const getScoreLabel = (isHomeScore: boolean, teamIndex: number) => {
    const homeTeam = watchIsHome ? "Broughty Pumas 2015s" : watchOpponent;
    const awayTeam = watchIsHome ? watchOpponent : "Broughty Pumas 2015s";
    const teamLabel = isHomeScore ? homeTeam : awayTeam;
    return `${teamLabel} Team ${teamIndex + 1} Score`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {showDateSelector && (
          <div className="space-y-2">
            <FormLabel>Date *</FormLabel>
            <Input 
              type="date" 
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} 
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
              }}
            />
          </div>
        )}

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
              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
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

        <div className="grid grid-cols-2 gap-4">
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
          
          <FormField
            control={form.control}
            name="number_of_teams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Teams</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      const newLength = parseInt(e.target.value) || 1;
                      form.setValue('home_score', Array(newLength).fill(""));
                      form.setValue('away_score', Array(newLength).fill(""));
                      form.setValue('motm_player_ids', Array(newLength).fill(""));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="meeting_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kick Off Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="4-a-side">4-a-side</SelectItem>
                  <SelectItem value="5-a-side">5-a-side</SelectItem>
                  <SelectItem value="7-a-side">7-a-side</SelectItem>
                  <SelectItem value="9-a-side">9-a-side</SelectItem>
                  <SelectItem value="11-a-side">11-a-side</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {Array.from({ length: watchNumberOfTeams }).map((_, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
            <FormField
              control={form.control}
              name={`home_score.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getScoreLabel(true, index)}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`away_score.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getScoreLabel(false, index)}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {players && (
              <FormField
                control={form.control}
                name={`motm_player_ids.${index}`}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Team {index + 1} Man of the Match</FormLabel>
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
                            {player.name} (#{player.squad_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        ))}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : editingFixture ? "Save Changes" : "Add Fixture"}
        </Button>
      </form>
    </Form>
  );
};