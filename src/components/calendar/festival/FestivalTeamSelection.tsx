import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Player } from '@/types/player';
import { supabase } from '@/integrations/supabase/client';

interface FestivalTeamSelectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  festival: any;
  onSuccess: () => void;
}

export const FestivalTeamSelection: React.FC<FestivalTeamSelectionProps> = ({
  isOpen,
  onOpenChange,
  festival,
  onSuccess
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
    }
  }, [isOpen]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Add implementation to save selected players for festival teams
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Teams for Festival</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div>Loading players...</div>
          ) : (
            <div>
              {/* Implement player selection UI here */}
              <div className="text-sm text-muted-foreground">
                Select players for festival teams
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
