
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    }
  }

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
        updateProfile
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
