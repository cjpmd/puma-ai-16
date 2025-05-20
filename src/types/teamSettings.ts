
export interface TeamSettings {
  id: string;
  team_id: string;
  admin_id: string;
  format: string;
  hide_scores_from_parents: boolean;
  parent_notification_enabled: boolean;
  attendance_colors: Record<string, string>;
  created_at: string;
  updated_at: string;
  team_name: string;
  team_colors: string[];
  team_logo?: string;
  kit_home_icon?: string;
  kit_away_icon?: string;
}
