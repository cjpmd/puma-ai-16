
import { z } from "zod";

export const fixtureFormSchema = z.object({
  id: z.string().optional(),
  opponent: z.string().min(1, "Opponent name is required"),
  location: z.string().optional(),
  number_of_teams: z.string().optional(),
  team_1_score: z.number().optional(),
  opponent_1_score: z.number().optional(),
  team_2_score: z.number().optional(),
  opponent_2_score: z.number().optional(),
  motm_player_ids: z.array(z.string().optional()),
  team_times: z.array(z.object({
    meeting_time: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    performance_category: z.string().default('MESSI'),
  })),
  is_home: z.boolean().default(true),
  format: z.string().default("7-a-side"),
  team_name: z.string().default("Broughty Pumas 2015s"),
});

export type FixtureFormData = z.infer<typeof fixtureFormSchema>;
