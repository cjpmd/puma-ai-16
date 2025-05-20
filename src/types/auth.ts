
// Centralized type definitions for user roles and authentication

// Define the user roles that are valid in the database
export type DatabaseUserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'user' | 'globalAdmin';

// For backwards compatibility with existing code 
export type UserRole = DatabaseUserRole;

// Define the specific subset of roles allowed in profiles table
export type ProfileRole = DatabaseUserRole;

// Helper function to safely cast roles
export const ensureValidProfileRole = (role: DatabaseUserRole): ProfileRole => {
  return role as ProfileRole;
};
