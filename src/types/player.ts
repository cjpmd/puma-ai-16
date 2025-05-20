
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
  profile_image?: string;
  attributeHistory?: Record<string, { date: string; value: number; }[]>;
  
  // Additional properties used in components
  objectives?: any[];
  topPositions?: any[];
  
  // Legacy camelCase aliases for backward compatibility
  squadNumber?: number;
  playerType?: string;
  dateOfBirth?: string;
  teamCategory?: string;
  profileImage?: string;
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

export enum AttributeCategory {
  TECHNICAL = 'TECHNICAL',
  MENTAL = 'MENTAL',
  PHYSICAL = 'PHYSICAL',
  GOALKEEPER = 'GOALKEEPER'
}

// Make PerformanceCategory a proper TypeScript enum
export enum PerformanceCategory {
  MESSI = 'MESSI',
  RONALDO = 'RONALDO',
  JAGS = 'JAGS',
  BECKHAM = 'BECKHAM',
  HESKEY = 'HESKEY'
}

export interface PlayerWithAttributes extends Player {
  attributes: PlayerAttribute[];
}

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: string;
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
