export type PlayerType = "OUTFIELD" | "GOALKEEPER";

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: string;
  abbreviation?: string;
}

export interface Player {
  id: string;
  name: string;
  dateOfBirth: string;
  squadNumber: number;
  playerType: PlayerType;
  teamCategory?: string;
  attributes: Attribute[];
  attributeHistory: Record<string, { date: string; value: number; }[]>;
}