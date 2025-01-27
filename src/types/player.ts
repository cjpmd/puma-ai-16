export type PlayerType = "OUTFIELD" | "GOALKEEPER";

export type AttributeCategory = "TECHNICAL" | "MENTAL" | "PHYSICAL" | "GOALKEEPING";

export type PerformanceCategory = "MESSI" | "RONALDO" | "JAGS";

export interface PlayerObjective {
  completed: number;
  improving: number;
  ongoing: number;
}

export interface TopPosition {
  position: string;
  suitability_score: number;
}

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: AttributeCategory;
  created_at?: string;
}

export interface Player {
  id: string;
  name: string;
  dateOfBirth: string;
  squadNumber: number;
  playerType: PlayerType;
  age: number;
  teamCategory?: string;
  attributes: Attribute[];
  attributeHistory?: Record<string, { date: string; value: number }[]>;
  objectives?: PlayerObjective;
  topPositions?: TopPosition[];
  created_at?: string;
  updated_at?: string;
}