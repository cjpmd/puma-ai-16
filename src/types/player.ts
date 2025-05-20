
// src/types/player.ts
export interface Player {
  id: string;
  name: string;
  age: number;
  squad_number?: number;
  player_type: string;
  team_id?: string;
  team_category?: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  self_linked: boolean;
  user_id?: string;
  attributes?: PlayerAttribute[];
  status?: string;
  linking_code?: string;
  profile_image?: string; // Add the profile_image field
}

export interface PlayerAttribute {
  id: string;
  player_id: string;
  name: string;
  category: string;
  value: number;
  created_at: string;
  abbreviation?: string;
}

export enum PlayerType {
  OUTFIELD = 'OUTFIELD',
  GOALKEEPER = 'GOALKEEPER'
}

// Add an AttributeCategory enum for the store/players.ts file
export enum AttributeCategory {
  TECHNICAL = 'TECHNICAL',
  MENTAL = 'MENTAL',
  PHYSICAL = 'PHYSICAL',
  GOALKEEPER = 'GOALKEEPER'
}

export interface PlayerWithAttributes extends Player {
  attributes: PlayerAttribute[];
}
