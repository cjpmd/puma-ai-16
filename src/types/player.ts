export type AttributeCategory = "GOALKEEPING" | "TECHNICAL" | "MENTAL" | "PHYSICAL";
export type PlayerCategory = "RONALDO" | "MESSI" | "JAGS";
export type PlayerType = "GOALKEEPER" | "OUTFIELD";

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: AttributeCategory;
  player_id?: string;
  created_at?: string;
}

export interface AttributeHistory {
  date: string;
  value: number;
}

export interface PlayerObjectives {
  completed?: number;
  improving?: number;
  ongoing?: number;
}

export interface TopPosition {
  position: string;
  suitability_score: number;
}

export interface FixturePlayerPosition {
  id: string;
  fixture_id: string;
  period_id: string;
  player_id: string;
  position: string;
  is_substitute: boolean;
  created_at: string;
  updated_at: string;
  fixtures?: {
    id: string;
    date: string;
    opponent: string;
    motm_player_id: string | null;
  };
  fixture_playing_periods?: {
    duration_minutes: number;
  };
}

export interface FixtureTeamSelection {
  fixture_id: string;
  is_captain: boolean;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  squadNumber: number;
  playerCategory: PlayerCategory;
  playerType: PlayerType;
  attributes: Attribute[];
  attributeHistory: Record<string, AttributeHistory[]>;
  objectives?: PlayerObjectives;
  topPositions?: TopPosition[];
  fixture_player_positions?: FixturePlayerPosition[];
  fixture_team_selections?: FixtureTeamSelection[];
  created_at?: string;
  updated_at?: string;
}