
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TeamSelection {
  event_id: string;
  event_type: string;
  player_id: string;
  position: string;
  team_number: number;
}

export const useTeamSelections = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTeamSelections = async (selections: TeamSelection[]) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('team_selections')
        .insert(selections);

      if (error) {
        console.error('Error saving team selections:', error);
        setError(error.message);
      } else {
        console.log('Team selections saved successfully:', data);
      }
    } catch (err) {
      console.error('Unexpected error saving team selections:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveTeamSelections,
  };
};

// Adding default export to maintain backward compatibility
export default useTeamSelections;
