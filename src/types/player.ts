export type PlayerType = "OUTFIELD" | "GOALKEEPER";

export type AttributeCategory = "TECHNICAL" | "MENTAL" | "PHYSICAL" | "GOALKEEPING";

export type PlayerCategory = "MESSI" | "RONALDO" | "JAGS";

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
  attributes: Attribute[];
  attributeHistory?: Record<string, { date: string; value: number }[]>;
  created_at?: string;
  updated_at?: string;
}