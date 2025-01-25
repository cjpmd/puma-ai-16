export interface Fixture {
  id: string;
  date: string;
  opponent: string;
  home_score: number | null;
  away_score: number | null;
  category: string;  // Made required by removing the optional '?'
  location?: string;
  motm_player_id?: string | null;
  time?: string | null;
  outcome?: string | null;
}