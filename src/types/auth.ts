
// Centralized type definitions for user roles and authentication
// This ensures consistency across the application

// Define the user roles that are valid in the database
export type DatabaseUserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'user' | 'globalAdmin';

// For backwards compatibility with existing code 
export type UserRole = DatabaseUserRole;
