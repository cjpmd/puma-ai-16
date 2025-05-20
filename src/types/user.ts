
import { UserRole } from "@/types/auth";

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  name?: string;
  role: UserRole;
  team_id?: string;
  club_id?: string;
  created_at: string;
  updated_at: string;
}
