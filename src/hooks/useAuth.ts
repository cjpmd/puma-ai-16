import { useState, useEffect, useContext, createContext } from "react";
import {
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define UserRole type here for better type safety across the app
export type UserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'globalAdmin' | 'user';

interface AuthContextType {
  profile: any | null;
  isLoading: boolean;
  addRole: (role: UserRole) => Promise<boolean>;
  hasRole: (role: UserRole) => boolean;
  activeRole: UserRole | null;
  switchRole: (role: UserRole) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This file is being replaced by useAuth.tsx, keeping only the type exports
export const useAuth = () => {
  throw new Error("useAuth.ts is deprecated - import from useAuth.tsx instead");
};

// Export the context for potential direct access
export { AuthContext };
