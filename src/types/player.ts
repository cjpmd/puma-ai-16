export type AttributeCategory = "GOALKEEPING" | "TECHNICAL" | "MENTAL" | "PHYSICAL";
export type PlayerCategory = "RONALDO" | "MESSI";

export interface Attribute {
  name: string;
  value: number;
  category: AttributeCategory;
  multiplier: number;
}

export interface AttributeHistory {
  date: string;
  value: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  squadNumber: number;
  playerCategory: PlayerCategory;
  attributes: Attribute[];
  attributeHistory: Record<string, AttributeHistory[]>;
}