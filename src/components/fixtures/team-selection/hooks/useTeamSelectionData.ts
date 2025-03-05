
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/player';
import { AllSelections, PeriodsPerTeam, TeamCaptains } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useTeamSelectionData = (fixtureId: string | undefined) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [periodsPerTeam, setPeriodsPerTeam] = useState<PeriodsPerTeam>({});
  const [selections, setSelections] = useState<Record<string, Record<string, Record<string, Record<string, { playerId: string; position: string; isSubstitution?: boolean; }>>>>({});
  const [performanceCategories, setPerformanceCategories] = useState<Record<string, string>>({});
  const [teamCaptains, setTeamCaptains] = useState<Record<string, string>>({});
  const [existingSelections, setExistingSelections] = useState<AllSelections>({});
  const [existingPeriods, setExistingPeriods] = useState<PeriodsPerTeam>({});
  const [existingCaptains, setExistingCaptains] = useState<TeamCaptains>({});

  // Fetch players for team selection
  const { data: players } = useQuery({
    queryKey: ['players-for-team-selection', fixtureId],
    queryFn: async () => {
      try {
        if (!fixtureId) return [];
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name');
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching players:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load players',
        });
        return [];
      }
    },
    enabled: !!fixtureId,
  });

  // Fetch existing selections for this fixture
  const { data: existingData, isLoading: isLoadingExisting } = useQuery({
    queryKey: ['fixture-team-selections', fixtureId],
    queryFn: async () => {
      try {
        if (!fixtureId) return { selections: {}, periods: {}, captains: {} };
        
        const { data, error } = await supabase
          .from('fixture_team_selections')
          .select('*')
          .eq('fixture_id', fixtureId);
          
        if (error) throw error;
        
        // Process the data into the format we need
        // This is simplified - you would need to adapt to your actual data structure
        return {
          selections: {},  // Process data into AllSelections format
          periods: {},     // Process data into PeriodsPerTeam format
          captains: {}     // Process data into TeamCaptains format
        };
      } catch (error) {
        console.error('Error fetching existing selections:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load existing team selections',
        });
        return { selections: {}, periods: {}, captains: {} };
      }
    },
    enabled: !!fixtureId,
  });

  useEffect(() => {
    if (players) {
      setAvailablePlayers(players);
    }
  }, [players]);

  useEffect(() => {
    if (!isLoadingExisting && existingData) {
      setExistingSelections(existingData.selections);
      setExistingPeriods(existingData.periods);
      setExistingCaptains(existingData.captains);
      setIsLoading(false);
    }
  }, [isLoadingExisting, existingData]);

  // Actions for managing team selections
  const actions = {
    setSelectedPlayers,
    addSelectedPlayer: (playerId: string) => {
      setSelectedPlayers(prev => new Set([...prev, playerId]));
    },
    removeSelectedPlayer: (playerId: string) => {
      setSelectedPlayers(prev => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
    },
    updatePeriodsPerTeam: setPeriodsPerTeam,
    updateSelections: setSelections,
    updatePerformanceCategories: setPerformanceCategories,
    updateTeamCaptains: setTeamCaptains
  };

  return {
    isLoading,
    availablePlayers,
    selectedPlayers,
    periodsPerTeam,
    selections,
    performanceCategories,
    teamCaptains,
    existingSelections,
    existingPeriods,
    existingCaptains,
    actions
  };
};
