
import { Json } from "@/integrations/supabase/types";
import { UserRole } from "@/hooks/useAuth.tsx"; 

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
  
  // Add these fields to match what TeamInfoSettings.tsx is expecting
  team_colors?: string;
  team_logo?: string;
  home_kit_icon?: string;
  away_kit_icon?: string;
  training_kit_icon?: string;
}

// Update to use the imported UserRole type
export type AllowedUserRoles = Extract<UserRole, 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'globalAdmin' | 'user'>;
