
import { useState, useEffect, useContext, createContext } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { updateUserRole } from "@/utils/database/updateUserRole";
import { supabase } from "@/integrations/supabase/client"; // Import the preconfigured supabase client

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        if (userError.message.includes('refresh_token_not_found')) {
          // Clear the session and redirect to auth
          await supabase.auth.signOut();
          navigate('/auth');
          return null;
        }
        throw userError;
      }
      
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return null;
      }

      console.log("Fetching profile for user ID:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast("Failed to load user profile", {
          description: error.message,
        });
        setIsLoading(false);
        return null;
      }

      console.log("Profile fetched:", data);
      
      // If no profile exists, create one with default role
      if (!data) {
        console.log("No profile found, creating one with default admin role");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id, 
              email: user.email, 
              role: 'admin' as UserRole,
              name: user.email,
              full_name: user.email
            }
          ])
          .select('*')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast("Failed to create user profile", {
            description: createError.message,
          });
          setIsLoading(false);
          return null;
        }

        setProfile(newProfile);
        setActiveRole(newProfile.role);
        setIsLoading(false);
        return newProfile;
      }

      setProfile(data);
      setActiveRole(data.role);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error('Auth error:', err);
      // If there's a refresh token error, sign out and redirect
      if (err instanceof Error && err.message.includes('refresh_token_not_found')) {
        await supabase.auth.signOut();
        navigate('/auth');
      }
      toast("Authentication error occurred", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
          }
          console.error('Session error:', error);
          navigate('/auth');
          return;
        }
        
        if (!session) {
          setIsLoading(false);
          return;
        }
        
        // If we have a session, fetch the user profile
        await fetchProfile();
      } catch (error) {
        console.error('Session initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Use our imported supabase client to avoid the undefined issue
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            setProfile(null);
            setActiveRole(null);
          }
        } else if (event === 'SIGNED_IN') {
          await fetchProfile();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Function to add a role to the current user
  const addRole = async (role: UserRole): Promise<boolean> => {
    if (!profile) return false;
    
    try {
      console.log(`Attempting to add ${role} role to user ${profile.id}`);
      
      const success = await updateUserRole(profile.id, role);
      if (!success) {
        console.error(`Failed to add ${role} role using updateUserRole utility`);
        toast(`Failed to add ${role} role. Please try again.`);
        return false;
      }
      
      // Refresh profile data
      await fetchProfile();
      
      toast(`Added ${role} role to your account`);

      // For global admin, immediately navigate to the dashboard
      if (role === 'globalAdmin') {
        console.log("Successfully added globalAdmin role, navigating to global admin page");
        setTimeout(() => {
          setActiveRole('globalAdmin');
          navigate('/global-admin');
        }, 500);
      }
      
      return true;
    } catch (err) {
      console.error('Error adding role:', err);
      toast("Failed to update roles");
      return false;
    }
  };

  // Function to switch between roles with immediate navigation
  const switchRole = (role: UserRole) => {
    console.log(`Switching to role: ${role}`);
    setActiveRole(role);
    
    // Navigate to appropriate dashboard based on role
    if (role === 'parent') {
      navigate('/parent-dashboard');
    } else if (role === 'player') {
      navigate('/player-dashboard');
    } else if (role === 'globalAdmin') {
      console.log('Navigating to global admin dashboard');
      navigate('/global-admin');
    } else {
      navigate('/platform');
    }
  };

  // Check if user has a specific role assigned
  const hasRole = (role: UserRole): boolean => {
    if (!profile) return false;
    
    console.log(`Checking if user has role ${role}, user role is ${profile.role}`);
    
    // Global Admin has access to all roles
    if (profile.role === 'globalAdmin') {
      console.log('User is globalAdmin, has access to all roles');
      return true;
    }
    
    // Admin has access to all roles except globalAdmin
    if (profile.role === 'admin' && role !== 'globalAdmin') {
      console.log('User is admin, has access to all roles except globalAdmin');
      return true;
    }
    
    // Coaches can also access parent role
    if (role === 'parent' && profile.role === 'coach') {
      console.log('User is coach, has access to parent role');
      return true;
    }
    
    const hasSpecificRole = profile.role === role;
    console.log(`User ${hasSpecificRole ? 'has' : 'does not have'} specific role ${role}`);
    return hasSpecificRole;
  };

  // Add refreshProfile function to expose the refetch function
  const refreshProfile = async () => {
    console.log("Refreshing user profile");
    await fetchProfile();
  };

  const value: AuthContextType = {
    profile,
    activeRole,
    switchRole,
    addRole,
    isLoading,
    hasRole,
    refreshProfile,
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

// Export the context for potential direct access
export { AuthContext };
