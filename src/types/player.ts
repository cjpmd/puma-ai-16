
// Update the Player type to include possible profile_image

export type PlayerType = 'OUTFIELD' | 'GOALKEEPER';

export type PerformanceCategory = 'MESSI' | 'HESKEY' | 'BECKHAM';

export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface PlayerAttributes {
  [key: string]: number;
}

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: string;
}

// Define the base Player interface without getters
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
  profile_image?: string;
  // Add these properties for compatibility with existing components
  attributes?: Attribute[];
  attributeHistory?: Record<string, { date: string; value: number; }[]>;
  // Add properties used in SquadManagement 
  objectives?: any[];
  topPositions?: any[];
  // Add camelCase property aliases directly as optional properties
  squadNumber?: number;
  playerType?: string;
  dateOfBirth?: string;
  teamCategory?: string;
  profileImage?: string;
}

// Helper function to transform database player object to our internal Player format
export const transformDbPlayerToPlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    squad_number: dbPlayer.squad_number,
    squadNumber: dbPlayer.squad_number,
    age: dbPlayer.age,
    date_of_birth: dbPlayer.date_of_birth,
    dateOfBirth: dbPlayer.date_of_birth,
    player_type: dbPlayer.player_type,
    playerType: dbPlayer.player_type,
    team_category: dbPlayer.team_category,
    teamCategory: dbPlayer.team_category,
    team_id: dbPlayer.team_id,
    created_at: dbPlayer.created_at,
    updated_at: dbPlayer.updated_at,
    self_linked: dbPlayer.self_linked,
    user_id: dbPlayer.user_id,
    linking_code: dbPlayer.linking_code,
    status: dbPlayer.status,
    profile_image: dbPlayer.profile_image,
    profileImage: dbPlayer.profile_image
  };
};

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
