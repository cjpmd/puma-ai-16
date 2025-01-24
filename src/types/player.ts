export type PlayerType = "OUTFIELD" | "GOALKEEPER";

export type AttributeCategory = "TECHNICAL" | "MENTAL" | "PHYSICAL" | "GOALKEEPING";

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: AttributeCategory;
  abbreviation?: string;
  created_at?: string;
  player_id?: string;
}

export interface PlayerObjectives {
  completed: number;
  improving: number;
  ongoing: number;
}

export interface TopPosition {
  position: string;
  suitability_score: number;
}

export interface Player {
  id: string;
  name: string;
  dateOfBirth: string;
  squadNumber: number;
  playerType: PlayerType;
  teamCategory?: string;
  age?: number;
  attributes: Attribute[];
  attributeHistory: Record<string, { date: string; value: number; }[]>;
  objectives?: PlayerObjectives;
  topPositions?: TopPosition[];
  created_at?: string;
  updated_at?: string;
}