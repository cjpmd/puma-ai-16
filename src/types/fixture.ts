export interface Fixture {
  id: string;
  date: string;
  opponent: string;
  home_score: number | null;
  away_score: number | null;
  category: string;
  location?: string;
  motm_player_id?: string | null;
  time?: string | null;
  outcome?: string | null;
  format?: string;
  team_name: string;
  is_friendly?: boolean;
  meeting_time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_home?: boolean;
  number_of_teams?: number;
  performance_category?: string;
}