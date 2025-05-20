
// Extend the Player interface to include all needed fields

export type PlayerType = 'OUTFIELD' | 'GOALKEEPER';

// Define performance categories
export type PerformanceCategory = 'MESSI' | 'RONALDO' | 'JAGS';

// Define attribute categories
export type AttributeCategory = 'TECHNICAL' | 'MENTAL' | 'PHYSICAL' | 'GOALKEEPING';

// Define the Attribute interface
export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: AttributeCategory;
}

// Main Player interface with all required properties
export interface Player {
  id: string;
  name: string;
  age?: number;
  squad_number?: number;
  squadNumber?: number; // For backwards compatibility
  date_of_birth?: string;
  dateOfBirth?: string; // For backwards compatibility
  player_type: PlayerType;
  playerType?: PlayerType; // For backwards compatibility
  status?: string;
  team_category?: string;
  teamCategory?: string; // For backwards compatibility
  team_id?: string;
  self_linked?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  profile_image?: string; // Field for player profile images
  profileImage?: string; // For backwards compatibility
  attributes?: Attribute[];
  attributeHistory?: Record<string, { date: string; value: number }[]>;
}

// Helper function to transform database player records to frontend Player objects
export const transformDbPlayerToPlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    age: dbPlayer.age,
    squad_number: dbPlayer.squad_number,
    squadNumber: dbPlayer.squad_number, // Add for backwards compatibility
    date_of_birth: dbPlayer.date_of_birth,
    dateOfBirth: dbPlayer.date_of_birth, // Add for backwards compatibility
    player_type: dbPlayer.player_type as PlayerType,
    playerType: dbPlayer.player_type as PlayerType, // Add for backwards compatibility
    status: dbPlayer.status,
    team_category: dbPlayer.team_category,
    teamCategory: dbPlayer.team_category, // Add for backwards compatibility
    team_id: dbPlayer.team_id,
    self_linked: dbPlayer.self_linked,
    user_id: dbPlayer.user_id,
    created_at: dbPlayer.created_at,
    updated_at: dbPlayer.updated_at,
    profile_image: dbPlayer.profile_image,
    profileImage: dbPlayer.profile_image, // Add for backwards compatibility
  };
};
