import { useState, useEffect, useContext, createContext } from "react";
import {
  useSession,
  useSupabaseClient,
  Session,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";

// Extend the default Session interface to include user role
interface CustomSession extends Session {
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    app_metadata: {
      provider: string;
      roles: string[];
    };
    user_metadata: any;
  };
}

// Define UserRole type here for better type safety across the app
export type UserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'globalAdmin' | 'user';

interface AuthContextType {
  session: CustomSession | null;
  profile: any | null;
  isLoading: boolean;
  addRole: (role: UserRole) => Promise<boolean>;
  hasRole: (role: UserRole) => boolean;
  activeRole: UserRole | null;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const supabaseClient = useSupabaseClient();
  const session = useSession() as CustomSession | null;
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      if (session?.user) {
        try {
          const { data, error } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
          } else {
            setProfile(data);
            setActiveRole(data?.role || null);
          }
        } catch (error) {
          console.error("Unexpected error fetching profile:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, supabaseClient]);

  const addRole = async (role: UserRole): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .update({ role: role })
        .eq("id", session.user.id);

      if (error) {
        console.error("Error adding role:", error);
        return false;
      }

      // Optimistically update the local profile state
      setProfile(prevProfile => ({ ...prevProfile, role: role }));
      setActiveRole(role);
      return true;
    } catch (error) {
      console.error("Unexpected error adding role:", error);
      return false;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role;
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    // Optionally, update something in local storage or a cookie
    console.log(`Active role set to ${role}`);
  };

  const value: AuthContextType = {
    session,
    profile,
    isLoading,
    addRole,
    hasRole,
    activeRole,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
