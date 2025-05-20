
export type PlayerType = 'OUTFIELD' | 'GOALKEEPER' | string;

export type AttributeCategory = 'TECHNICAL' | 'MENTAL' | 'PHYSICAL' | 'GOALKEEPING';

export type PerformanceCategory = 'MESSI' | 'RONALDO' | 'JAGS' | string;

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: AttributeCategory;
  abbreviation?: string;
}

export interface Player {
  // Original properties (snake_case from DB)
  id: string;
  name: string;
  playerType: PlayerType; // Already camelCase
  squad_number?: number;
  team_category?: string;
  status: string;
  age?: number;
  created_at?: string;
  updated_at?: string;
  date_of_birth?: string;
  linking_code?: string;
  self_linked?: boolean;
  team_id?: string;
  user_id?: string;
  profile_image?: string;
  
  // Added camelCase aliases for convenience in frontend components
  squadNumber?: number;
  teamCategory?: string;
  dateOfBirth?: string;
  
  // Additional properties used in components
  attributes?: Attribute[];
  attributeHistory?: Record<string, { date: string; value: number }[]>;
  profileImage?: string;
}

// Helper function to transform snake_case DB fields to camelCase for frontend use
export const transformDbPlayerToPlayer = (dbPlayer: any): Player => {
  return {
    ...dbPlayer,
    playerType: dbPlayer.player_type || 'OUTFIELD',
    squadNumber: dbPlayer.squad_number,
    teamCategory: dbPlayer.team_category,
    dateOfBirth: dbPlayer.date_of_birth,
    profileImage: dbPlayer.profile_image,
    // Any other transformations needed
  };
};
