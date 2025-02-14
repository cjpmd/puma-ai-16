
export interface FixtureTeamScore {
  team_number: number;
  score: number;
  opponent_score: number;
  fixture_id: string;
}

export interface FixtureTeamTime {
  meeting_time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  performance_category?: string;
}

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
  team_times?: FixtureTeamTime[];
  [key: string]: any; // Allow dynamic score properties
}
