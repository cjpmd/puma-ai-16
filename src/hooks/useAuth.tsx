
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive"
          });
          return null;
        }

        // If no profile exists, create one with default role
        if (!data) {
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
            .select()
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
          refetchProfile();
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
      // First check if the role is "globalAdmin" - it might not be in the enum
      if (role === 'globalAdmin') {
        console.log('Attempting to add globalAdmin role via direct update');
        
        // Try a direct SQL update instead of using the enum
        const { error } = await supabase.rpc('update_user_role', {
          p_user_id: profile.id,
          p_role: 'globalAdmin'
        });
        
        if (error) {
          // If the RPC fails, try a direct update
          console.warn('RPC failed, trying direct update:', error);
          const { error: directError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', profile.id);
            
          if (directError) {
            console.error('Error adding role via direct update:', directError);
            toast({
              title: "Error",
              description: `Failed to add ${role} role. The role may not exist in the database.`,
              variant: "destructive"
            });
            return false;
          }
        }
      } else {
        // Update the user's role in the profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', profile.id);
          
        if (error) {
          console.error('Error adding role:', error);
          toast({
            title: "Error",
            description: `Failed to add ${role} role`,
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Refresh profile data
      await refetchProfile();
      
      toast({
        title: "Success",
        description: `Added ${role} role to your account`,
      });
      
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

  // Function to switch between roles
  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    // Navigate to appropriate dashboard based on role
    if (role === 'parent') {
      navigate('/parent-dashboard');
    } else if (role === 'player') {
      navigate('/player-dashboard');
    } else if (role === 'globalAdmin') {
      navigate('/global-admin');
    } else {
      navigate('/platform');
    }
  };

  const hasPermission = (requiredRole: UserRole[]): boolean => {
    if (!profile) return false;
    
    if (profile.role === 'globalAdmin') return true; // Global admin has all permissions
    if (profile.role === 'admin') return true;
    
    if (requiredRole.includes('parent') && profile.role === 'coach') return true;
    
    return requiredRole.includes(profile.role);
  };

  // Check if user has a specific role assigned
  const hasRole = (role: UserRole): boolean => {
    if (!profile) return false;
    
    // Global Admin has access to all roles
    if (profile.role === 'globalAdmin') return true;
    
    // Admin has access to all roles except globalAdmin
    if (profile.role === 'admin' && role !== 'globalAdmin') return true;
    
    // Coaches can also access parent role
    if (role === 'parent' && profile.role === 'coach') return true;
    
    return profile.role === role;
  };

  return {
    profile,
    activeRole,
    switchRole,
    addRole,
    isLoading: isInitializing || profileLoading,
    hasPermission,
    hasRole,
  };
};
