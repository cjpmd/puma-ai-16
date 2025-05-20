
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole, ensureValidRole, isValidRole } from '@/types/auth';

// Define the Auth context type
export interface AuthContextType {
  session: any;
  user: any;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  
  isLoading: boolean;
  activeRole: UserRole | null;
  switchRole: (role: UserRole) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  addRole: (role: UserRole) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  loading: true,
  
  isLoading: true,
  activeRole: null,
  switchRole: () => {},
  hasRole: () => false,
  addRole: async () => false,
  refreshProfile: async () => {},
});

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    };

    fetchSession();

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      setIsLoading(true);
      try {
        if (user) {
          let { data, error, status } = await supabase
            .from('profiles')
            .select(`*`)
            .eq('id', user.id)
            .single()

          if (error && status !== 406) {
            throw error
          }

          if (data) {
            // Ensure the role is valid
            const validRole = ensureValidRole(data.role);
            const typedProfile: Profile = {
              ...data,
              role: validRole
            };
            setProfile(typedProfile);
            setActiveRole(validRole);
          } else {
            setProfile(null);
            setActiveRole('user'); // Default role
          }
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    }

    getProfile();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing in:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user', // Default role
          }
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing up:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const switchRole = (role: UserRole) => {
    setActiveRole(role);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!profile) return false;

    if (Array.isArray(role)) {
      return role.includes(profile.role);
    }

    return profile.role === role;
  };

  const addRole = async (role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Validate the role before updating
      if (!isValidRole(role)) {
        console.error("Invalid role:", role);
        return false;
      }

      // Update profile with the validated role
      const { error } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', user?.id);

      if (error) {
        console.error("Error updating role:", error.message);
        return false;
      } else {
        setProfile(prev => prev ? { ...prev, role } : null);
        setActiveRole(role);
        return true;
      }
    } catch (error: any) {
      console.error("Error adding role:", error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      if (user) {
        let { data, error, status } = await supabase
          .from('profiles')
          .select(`*`)
          .eq('id', user.id)
          .single()

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          const validRole = ensureValidRole(data.role);
          const typedProfile: Profile = {
            ...data,
            role: validRole
          };
          setProfile(typedProfile);
          setActiveRole(validRole);
        }
      }
    } catch (error: any) {
      console.error("Error refreshing profile:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    isLoading,
    activeRole,
    switchRole,
    hasRole,
    addRole,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
