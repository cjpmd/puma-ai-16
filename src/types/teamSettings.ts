
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
  home_kit_icon?: string;
  away_kit_icon?: string;
  training_kit_icon?: string;
}

// Add the AllowedUserRoles type that TeamUsersManager depends on
export type AllowedUserRoles = "admin" | "manager" | "coach" | "parent" | "globalAdmin";
