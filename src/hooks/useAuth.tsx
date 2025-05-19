
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Update the UserRole type to include all necessary roles
export type UserRole = 
  | 'user'
  | 'admin'
  | 'manager'
  | 'coach'
  | 'parent'
  | 'player'
  | 'globalAdmin';

export interface AuthProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  full_name?: string;
  team_id?: string;
  club_id?: string;
}

interface AuthContextType {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: Partial<AuthProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
  
  // Add missing properties
  activeRole: UserRole | null;
  switchRole: (role: UserRole) => void;
  hasRole: (role: UserRole) => boolean;
  addRole: (role: UserRole) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      
      setLoading(false);
    };

    initializeAuth();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Set active role whenever profile changes
  useEffect(() => {
    if (profile) {
      setActiveRole(profile.role);
    } else {
      setActiveRole(null);
    }
  }, [profile]);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data as AuthProfile);
        setActiveRole(data.role);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }
  }

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<AuthProfile>) => {
    try {
      setError(null);
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: userData?.role || 'user',
            name: userData?.name || email,
          }
        }
      });
      
      if (error) {
        setError(error.message);
        return;
      }

      // If signup successful, create a profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: userData?.role || 'user',
            name: userData?.name || data.user.email,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          setError('Failed to create user profile');
        }
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateProfile = async (data: Partial<AuthProfile>) => {
    if (!user) return;
    
    try {
      setError(null);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) {
        setError(error.message);
        return;
      }
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    // If checking for the user's primary role
    if (profile?.role === role) return true;
    
    // For future: implement check against user_roles table for additional roles
    return false;
  };

  const switchRole = (role: UserRole): void => {
    if (hasRole(role)) {
      setActiveRole(role);
    }
  };

  const addRole = async (role: UserRole): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // For primary role, just update the profile
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error adding role:', error);
        return false;
      }
      
      // Update local state
      setProfile(prev => prev ? { ...prev, role } : null);
      setActiveRole(role);
      
      return true;
    } catch (error) {
      console.error('Unexpected error adding role:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        updateProfile,
        activeRole,
        switchRole,
        hasRole,
        addRole,
        refreshProfile,
        isLoading: loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
