
import React, { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { FixtureFormData } from "./schemas/fixtureFormSchema";
import { supabase } from "@/integrations/supabase/client";

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
  getMotmLabel
}: TeamCardProps) => {
  // Load existing scores when the component mounts
  useEffect(() => {
    const loadExistingScores = async () => {
      const formValues = form.getValues();
      if (!formValues.id) return;

      try {
        // Fetch both scores and team times
        const [{ data: scores, error: scoresError }, { data: times, error: timesError }] = await Promise.all([
          supabase
            .from('fixture_team_scores')
            .select('*')
            .eq('fixture_id', formValues.id)
            .eq('team_number', index + 1)
            .single(),
          supabase
            .from('fixture_team_times')
            .select('*')
            .eq('fixture_id', formValues.id)
            .eq('team_number', index + 1)
            .single()
        ]);

        if (scoresError) {
          console.error('Error loading scores:', scoresError);
          return;
        }

        if (scores) {
          const isHome = formValues.is_home;
          // Set score based on team number and home/away status
          if (isHome) {
            form.setValue(`home_score.${index}`, scores.score.toString());
          } else {
            form.setValue(`away_score.${index}`, scores.score.toString());
          }
        }

        if (times) {
          form.setValue(`team_times.${index}`, {
            meeting_time: times.meeting_time || '',
            start_time: times.start_time || '',
            end_time: times.end_time || '',
            performance_category: times.performance_category || 'MESSI'
          });
        }

      } catch (error) {
        console.error('Error in loadExistingScores:', error);
      }
    };

    loadExistingScores();
  }, [form, index]);

  return (
    <Card className="p-4">
      <CardContent className="space-y-4">
        <div className="text-lg font-semibold mb-4 flex justify-between items-center">
          <span>Team {index + 1}</span>
          <FormField
            control={form.control}
            name={`team_times.${index}.performance_category`}
            render={({ field }) => (
              <FormItem className="w-48">
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Performance Category" />
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
                <FormLabel>{getScoreLabel(true, index)}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    min="0"
                    onChange={(e) => {
                      field.onChange(e);
                      console.log('Home score changed:', e.target.value);
                    }}
                  />
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
                  <Input 
                    type="number" 
                    {...field} 
                    min="0"
                    onChange={(e) => {
                      field.onChange(e);
                      console.log('Away score changed:', e.target.value);
                    }}
                  />
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
  );
};
