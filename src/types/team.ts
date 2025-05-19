
export interface Team {
  id: string;
  team_name: string;
  admin_id: string;
  club_id?: string;
  age_group?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  joined_club_at?: string;
  subscription_expiry?: string;
  contact_email?: string;
  team_color?: string;
  subscription_status?: string;
  team_logo?: string;
}
