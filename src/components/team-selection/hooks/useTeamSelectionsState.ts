
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamSelectionPeriod, TeamSelectionsByPeriod } from '../types';
import { PerformanceCategory } from '@/types/player';

interface UseTeamSelectionsStateProps {
  onTeamSelectionsChange?: (selections: TeamSelectionsByPeriod) => void;
  fixtureId?: string;
  teamId?: string;
}

// Define a more specific type for selections data
interface TeamSelectionData {
  id: string;
  event_id: string;
  event_type: string;
  player_id: string;
  position: string;
  period_id: string;
  period_number: number;
  duration_minutes: number;
  team_number: number;
  is_substitute: boolean;
  performance_category: string;
  created_at: string;
  updated_at: string;
  position_key?: string;
  team_id?: string;
  formation_template?: string;
}

export const useTeamSelectionsState = ({
  onTeamSelectionsChange,
  fixtureId,
  teamId
}: UseTeamSelectionsStateProps) => {
  const [teamSelectionsByPeriod, setTeamSelectionsByPeriod] = useState<TeamSelectionsByPeriod>({});
  const [periods, setPeriods] = useState<TeamSelectionPeriod[]>([]);
  const [currentPeriodId, setCurrentPeriodId] = useState<string>('');
  const [activePeriodNumber, setActivePeriodNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formationTemplates, setFormationTemplates] = useState<Record<string, string>>({});

  // Fetch existing team selections and periods
  useEffect(() => {
    if (fixtureId) {
      fetchExistingSelections();
      fetchPeriods();
    }
  }, [fixtureId]);

  // Notify parent component when selections change
  useEffect(() => {
    if (onTeamSelectionsChange) {
      onTeamSelectionsChange(teamSelectionsByPeriod);
    }
  }, [teamSelectionsByPeriod, onTeamSelectionsChange]);

  const fetchExistingSelections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_selections')
        .select('*')
        .eq('event_id', fixtureId)
        .eq('event_type', 'FIXTURE');

      if (error) throw error;

      if (data && data.length > 0) {
        const selectionsByPeriod: TeamSelectionsByPeriod = {};

        data.forEach((selection: TeamSelectionData) => {
          // Skip if teamId is specified and doesn't match
          // Check both team_id and legacy team_number
          if (teamId && selection.team_id && selection.team_id !== teamId) {
            return;
          }

          const periodId = selection.period_id;
          if (!selectionsByPeriod[periodId]) {
            selectionsByPeriod[periodId] = {};
            
            // Store formation template if available
            if (selection.formation_template) {
              setFormationTemplates(prev => ({
                ...prev,
                [periodId]: selection.formation_template || ''
              }));
            }
          }

          selectionsByPeriod[periodId][selection.position_key || `pos-${selection.id}`] = {
            playerId: selection.player_id,
            position: selection.position,
            performanceCategory: selection.performance_category as PerformanceCategory,
            isSubstitution: selection.is_substitute
          };
        });

        setTeamSelectionsByPeriod(selectionsByPeriod);
      }
    } catch (error) {
      console.error('Error fetching existing team selections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_periods')
        .select('*')
        .eq('event_id', fixtureId)
        .eq('event_type', 'FIXTURE')
        .order('period_number', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Filter by team_id if specified
        const filteredPeriods = teamId 
          ? data.filter(p => !p.team_id || p.team_id === teamId) 
          : data;
        
        setPeriods(filteredPeriods);
        
        if (filteredPeriods.length > 0) {
          setCurrentPeriodId(filteredPeriods[0].id);
          setActivePeriodNumber(filteredPeriods[0].period_number);
        }
      }
    } catch (error) {
      console.error('Error fetching periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectionsForPeriod = (periodId: string, selections: Record<string, any>) => {
    setTeamSelectionsByPeriod(prev => ({
      ...prev,
      [periodId]: selections
    }));
  };

  const updateFormationTemplate = (periodId: string, template: string) => {
    setFormationTemplates(prev => ({
      ...prev,
      [periodId]: template
    }));
  };

  return {
    periods,
    setPeriods,
    currentPeriodId,
    setCurrentPeriodId,
    activePeriodNumber,
    setActivePeriodNumber,
    teamSelectionsByPeriod,
    updateSelectionsForPeriod,
    formationTemplates,
    updateFormationTemplate,
    loading
  };
};
