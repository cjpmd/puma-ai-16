
import { Json } from "@/integrations/supabase/types";

export interface TeamSettings {
  id: string;
  team_id: string;
  team_name: string;
  admin_id: string;
  format: string;
  hide_scores_from_parents: boolean;
  parent_notification_enabled: boolean;
  attendance_colors: Json;
  created_at: string;
  updated_at: string;
  
  // Add missing fields referenced in TeamInfoSettings.tsx
  team_colors?: string[];
  team_logo?: string;
  home_kit_icon?: string;
  away_kit_icon?: string;
  training_kit_icon?: string;
}

export type AllowedUserRoles = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'globalAdmin';
