
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { updateUserRole } from '@/utils/database/updateUserRole';

export type UserRole = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'globalAdmin';

interface UserProfile {
  id: string;
  role: UserRole;
  email: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
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
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive"
          });
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
                name: user.email 
              }
            ])
            .select('*')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast({
              title: "Error",
              description: "Failed to create user profile",
              variant: "destructive"
            });
            return null;
          }

          return newProfile as UserProfile;
        }

        return data as UserProfile;
      } catch (err) {
        console.error('Auth error:', err);
        // If there's a refresh token error, sign out and redirect
        if (err instanceof Error && err.message.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          navigate('/auth');
        }
        toast({
          title: "Error",
          description: "Authentication error occurred",
          variant: "destructive"
        });
        return null;
      }
    },
    retry: false,
    enabled: !isInitializing
  });

  useEffect(() => {
    if (profile && !activeRole) {
      console.log("Setting active role from profile:", profile.role);
      setActiveRole(profile.role);
    }
  }, [profile, activeRole]);

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
          navigate('/auth');
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        navigate('/auth');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            navigate('/auth');
          }
        } else if (event === 'SIGNED_IN') {
          await refetchProfile();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, refetchProfile]);

  // Function to add a role to the current user
  const addRole = async (role: UserRole): Promise<boolean> => {
    if (!profile) return false;
    
    try {
      console.log(`Attempting to add ${role} role to user ${profile.id}`);
      
      const success = await updateUserRole(profile.id, role);
      if (!success) {
        console.error(`Failed to add ${role} role using updateUserRole utility`);
        toast({
          title: "Error",
          description: `Failed to add ${role} role. Please try again.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Refresh profile data
      await refetchProfile();
      
      toast({
        title: "Success",
        description: `Added ${role} role to your account`,
      });

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
      toast({
        title: "Error",
        description: "Failed to update roles",
        variant: "destructive"
      });
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

  return {
    profile,
    activeRole,
    switchRole,
    addRole,
    isLoading: isInitializing || profileLoading,
    hasRole,
  };
};
