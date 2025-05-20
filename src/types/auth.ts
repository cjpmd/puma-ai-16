
// Centralized type definitions for user roles and authentication

// Define the user roles that are valid in the database
export type DatabaseUserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'user' | 'globalAdmin';

// For backwards compatibility with existing code 
export type UserRole = DatabaseUserRole;

// Define the specific subset of roles allowed in profiles table
// This is what's causing issues in UserManagement.tsx and similar files
export type ProfileRole = 'admin' | 'manager' | 'coach' | 'parent' | 'globalAdmin';

// Helper function to safely cast roles
export const ensureValidProfileRole = (role: DatabaseUserRole): ProfileRole => {
  const validRoles: ProfileRole[] = ['admin', 'manager', 'coach', 'parent', 'globalAdmin'];
  return validRoles.includes(role as any) ? (role as ProfileRole) : 'parent';
};
