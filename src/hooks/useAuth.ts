import { useState, useEffect, useContext, createContext } from "react";
import {
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProfileRole } from "@/types/auth";

// This file is being replaced by useAuth.tsx, keeping only the type exports
export const useAuth = () => {
  throw new Error("useAuth.ts is deprecated - import from useAuth.tsx instead");
};

// Export the context for potential direct access
export const AuthContext = createContext<any>(undefined);
