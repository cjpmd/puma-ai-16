export type AttributeCategory = "GOALKEEPING" | "TECHNICAL" | "MENTAL" | "PHYSICAL";

export interface Attribute {
  name: string;
  value: number;
  category: AttributeCategory;
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
  attributes: Attribute[];
  attributeHistory: Record<string, AttributeHistory[]>;
}