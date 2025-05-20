
// Extending the Player interface to include profile_image

export type PlayerType = 'OUTFIELD' | 'GOALKEEPER';

export interface Player {
  id: string;
  name: string;
  age?: number;
  squad_number?: number;
  date_of_birth?: string;
  player_type: PlayerType;
  status?: string;
  team_category?: string;
  team_id?: string;
  self_linked?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  profile_image?: string; // Add this field for player profile images
  attributes?: any[];
}

// Helper function to transform database player records to frontend Player objects
export const transformDbPlayerToPlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    age: dbPlayer.age,
    squad_number: dbPlayer.squad_number,
    date_of_birth: dbPlayer.date_of_birth,
    player_type: dbPlayer.player_type as PlayerType,
    status: dbPlayer.status,
    team_category: dbPlayer.team_category,
    team_id: dbPlayer.team_id,
    self_linked: dbPlayer.self_linked,
    user_id: dbPlayer.user_id,
    created_at: dbPlayer.created_at,
    updated_at: dbPlayer.updated_at,
    profile_image: dbPlayer.profile_image
  };
};
