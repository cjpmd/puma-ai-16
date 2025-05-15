
import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  team_name: string;
  age_group?: string;
  team_logo?: string;
}

interface TeamsContextType {
  teams: Team[];
  activeTeam: Team | null;
  loading: boolean;
  setActiveTeam: (team: Team) => void;
  refreshTeams: () => Promise<void>;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamsContextProvider");
  }
  return context;
};

interface TeamsContextProviderProps {
  children: ReactNode;
}

export const TeamsContextProvider = ({ children }: TeamsContextProviderProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTeams = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        setTeams([]);
        setActiveTeam(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("admin_id", user.user.id);

      if (error) throw error;

      const teamsData = data as Team[];
      setTeams(teamsData);
      
      // If there are teams but no active team, set the first one as active
      if (teamsData.length > 0 && !activeTeam) {
        setActiveTeam(teamsData[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setLoading(false);
    }
  };

  // Load teams on context mount
  useState(() => {
    refreshTeams();
  });

  return (
    <TeamsContext.Provider
      value={{
        teams,
        activeTeam,
        loading,
        setActiveTeam,
        refreshTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
};
