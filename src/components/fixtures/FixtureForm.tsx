
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
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  location: z.string().optional(),
  number_of_teams: z.string().optional(),
  home_score: z.array(z.string().optional()),
  away_score: z.array(z.string().optional()),
  motm_player_ids: z.array(z.string().optional()),
  team_times: z.array(z.object({
    meeting_time: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
  })),
  is_home: z.boolean().default(true),
  format: z.string().default("7-a-side"),
  team_name: z.string().default("Broughty Pumas 2015s"),
});

type FormData = z.infer<typeof formSchema>;

interface FixtureFormProps {
  onSubmit: (data: FormData) => void;
  selectedDate?: Date;
  editingFixture?: any;
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
      team_times: editingFixture?.team_times || [{ 
        meeting_time: "", 
        start_time: "", 
        end_time: "" 
      }],
      is_home: editingFixture?.is_home ?? true,
      team_name: editingFixture?.team_name || "Broughty Pumas 2015s",
    },
  });

  const watchNumberOfTeams = parseInt(form.watch("number_of_teams") || "1");
  const watchOpponent = form.watch("opponent");
  const watchIsHome = form.watch("is_home");

  // Update team times array when number of teams changes
  React.useEffect(() => {
    const currentTimes = form.getValues("team_times");
    if (currentTimes.length !== watchNumberOfTeams) {
      const newTimes = Array(watchNumberOfTeams).fill(null).map((_, i) => 
        currentTimes[i] || { meeting_time: "", start_time: "", end_time: "" }
      );
      form.setValue("team_times", newTimes);
    }
  }, [watchNumberOfTeams, form]);

  const getScoreLabel = (isHomeScore: boolean, teamIndex: number, teamCategory?: string) => {
    const homeTeam = watchIsHome ? "Broughty Pumas 2015s" : watchOpponent;
    const awayTeam = watchIsHome ? watchOpponent : "Broughty Pumas 2015s";
    const teamLabel = isHomeScore ? homeTeam : awayTeam;

    if (teamLabel === "Broughty Pumas 2015s") {
      const categoryLabel = teamCategory ? ` ${teamCategory}` : '';
      return `Team ${teamIndex + 1}${categoryLabel} Score`;
    }
    return `${teamLabel} Score`;
  };

  const getMotmLabel = (teamIndex: number, teamCategory?: string) => {
    const categoryLabel = teamCategory ? ` ${teamCategory}` : '';
    return `Team ${teamIndex + 1}${categoryLabel} Man of the Match`;
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
          <Card key={index} className="p-4">
            <CardContent className="space-y-4">
              <div className="text-lg font-semibold">Team {index + 1} Times</div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`team_times.${index}.meeting_time`}
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
                  name={`team_times.${index}.start_time`}
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
                  name={`team_times.${index}.end_time`}
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`home_score.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getScoreLabel(true, index, editingFixture?.performance_category || 'MESSI')}</FormLabel>
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
                      <FormLabel>{getScoreLabel(false, index, editingFixture?.performance_category || 'MESSI')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
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
                      <FormLabel>{getMotmLabel(index, editingFixture?.performance_category || 'MESSI')}</FormLabel>
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
            </CardContent>
          </Card>
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
