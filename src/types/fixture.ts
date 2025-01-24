export interface Fixture {
  id: string;
  date: string;
  opponent: string;
  home_score: number | null;
  away_score: number | null;
  category?: string;
  location?: string;
  motm_player_id?: string | null;
  time?: string | null;
  outcome?: string | null;
}