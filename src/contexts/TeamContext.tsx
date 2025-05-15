
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Team interface
interface Team {
  id: string;
  team_name: string;
  age_group?: string;
  location?: string;
  contact_email?: string;
  team_color?: string;
}

interface TeamsContextProps {
  teams: Team[];
  loading: boolean;
  error: any;
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
  refreshTeams: () => Promise<void>;
}

const TeamsContext = createContext<TeamsContextProps | undefined>(undefined);

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
};

export const TeamsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);

  // Function to fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: userProfile, error: profileError } = await supabase.auth.getUser();
      
      if (profileError) throw profileError;
      
      // Use only fields that are guaranteed to exist
      const { data, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name, age_group, location, contact_email, team_color')
        .eq('admin_id', userProfile.user?.id);
      
      if (teamsError) {
        throw teamsError;
      }
      
      setTeams(data || []);
      
      // Set first team as current if we have teams and no current team
      if (data && data.length > 0 && !currentTeam) {
        setCurrentTeam(data[0]);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err);
      toast.error('Failed to load teams', {
        description: 'There was a problem loading your teams'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  // Refresh teams data
  const refreshTeams = async () => {
    await fetchTeams();
  };

  return (
    <TeamsContext.Provider
      value={{
        teams,
        loading,
        error,
        currentTeam,
        setCurrentTeam,
        refreshTeams
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
