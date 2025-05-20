
// Update the Player type to include possible profile_image

export type PlayerType = 'OUTFIELD' | 'GOALKEEPER';

export type PerformanceCategory = 'MESSI' | 'HESKEY' | 'BECKHAM';

export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface PlayerAttributes {
  [key: string]: number;
}

export interface Player {
  id: string;
  name: string;
  squad_number?: number;
  age?: number;
  date_of_birth?: string;
  player_type: PlayerType;
  team_category?: string;
  team_id?: string;
  created_at?: string;
  updated_at?: string;
  self_linked?: boolean;
  user_id?: string; 
  linking_code?: string;
  status?: string;
  profile_image?: string; // Added to support profile images
}

export interface PlayerWithAttributes extends Player {
  attributes: {
    id: string;
    player_id: string;
    name: string;
    value: number;
    category: string;
    created_at: string;
  }[];
}

export interface Position {
  id: string;
  abbreviation: string;
  full_name: string;
  description?: string;
}

export interface PositionSuitability {
  player_id: string;
  position_id: string;
  position: {
    id: string;
    abbreviation: string;
    full_name: string;
  };
  suitability_score: number;
}
