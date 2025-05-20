
// Centralized type definitions for user roles and authentication

// Define the user roles that are valid in the database
export type UserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'user' | 'globalAdmin';

// Define the Profile interface with strict typing
export interface Profile {
  id: string;
  user_id?: string;
  email?: string;
  name?: string;
  role: UserRole;
  team_id?: string;
  club_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to safely validate roles
export const isValidRole = (role: string): role is UserRole => {
  const validRoles: UserRole[] = ['admin', 'manager', 'coach', 'parent', 'player', 'user', 'globalAdmin'];
  return validRoles.includes(role as UserRole);
};

// Helper function to ensure a valid role or default to 'user'
export const ensureValidRole = (role: string): UserRole => {
  return isValidRole(role) ? role : 'user';
};
