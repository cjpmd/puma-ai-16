
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'manager' | 'coach' | 'parent';

interface UserProfile {
  id: string;
  role: UserRole;
  email: string | null;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
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
                role: 'parent',
                name: user.email // name is required by our schema
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
        toast({
          title: "Error",
          description: "Authentication error occurred",
          variant: "destructive"
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    retry: false
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const hasPermission = (requiredRole: UserRole[]): boolean => {
    if (!profile) return false;
    return requiredRole.includes(profile.role);
  };

  return {
    profile,
    isLoading: isLoading || profileLoading,
    hasPermission,
  };
};
