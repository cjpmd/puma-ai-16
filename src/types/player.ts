
export type PlayerType = "OUTFIELD" | "GOALKEEPER";

export type AttributeCategory = "TECHNICAL" | "MENTAL" | "PHYSICAL" | "GOALKEEPING";

export type PerformanceCategory = "MESSI" | "RONALDO" | "JAGS";

export interface PlayerObjective {
  completed: number;
  improving: number;
  ongoing: number;
}

export interface TopPosition {
  position: string;
  suitability_score: number;
}

export interface Attribute {
  id: string;
  name: string;
  value: number;
  category: AttributeCategory;
  created_at?: string;
}

export type PlayerStatus = "active" | "transferred_out" | "left" | "transfer_pending";

// Extended Player interface
export interface Player {
  id: string;
  name: string;
  dateOfBirth: string;
  squadNumber?: number;
  playerType: PlayerType;
  age?: number;
  teamCategory?: string;
  profileImage?: string;
  attributes?: Attribute[];
  attributeHistory?: Record<string, { date: string; value: number }[]>;
  objectives?: PlayerObjective;
  topPositions?: TopPosition[];
  created_at?: string;
  updated_at?: string;
  status?: PlayerStatus;
  // Added fields for compatibility with database structure
  date_of_birth?: string;
  squad_number?: number;
  player_type?: string;
  team_id?: string;
  self_linked?: boolean;
  user_id?: string;
  team_category?: string;
  linking_code?: string;
}

// Function to transform database player to Player interface
export function transformDbPlayerToPlayer(dbPlayer: any): Player {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    dateOfBirth: dbPlayer.date_of_birth || '',
    playerType: dbPlayer.player_type as PlayerType || 'OUTFIELD',
    age: dbPlayer.age || 0,
    squadNumber: dbPlayer.squad_number || 0,
    // Include original DB fields for backward compatibility
    date_of_birth: dbPlayer.date_of_birth,
    squad_number: dbPlayer.squad_number,
    player_type: dbPlayer.player_type,
    team_id: dbPlayer.team_id,
    self_linked: dbPlayer.self_linked,
    user_id: dbPlayer.user_id,
    team_category: dbPlayer.team_category,
    linking_code: dbPlayer.linking_code,
    status: dbPlayer.status,
    created_at: dbPlayer.created_at,
    updated_at: dbPlayer.updated_at,
    // Initialize empty attributes array
    attributes: [],
  };
}
