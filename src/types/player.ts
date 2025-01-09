export type AttributeCategory = "GOALKEEPING" | "TECHNICAL" | "MENTAL" | "PHYSICAL";
export type PlayerCategory = "RONALDO" | "MESSI" | "JAGS";

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

export interface Player {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  squadNumber: number;
  playerCategory: PlayerCategory;
  attributes: Attribute[];
  attributeHistory: Record<string, AttributeHistory[]>;
  created_at?: string;
  updated_at?: string;
}