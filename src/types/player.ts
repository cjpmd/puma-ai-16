
export type PlayerType = 'OUTFIELD' | 'GOALKEEPER' | string;

export interface Player {
  id: string;
  name: string;
  playerType: PlayerType;
  squad_number: number;
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
}
