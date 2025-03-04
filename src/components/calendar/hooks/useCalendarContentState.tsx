
import { useState, useEffect, useRef } from "react";

interface UseCalendarContentStateProps {
  fixtures: any[];
  festivals: any[];
  tournaments: any[];
  onRefetchFixtures: () => void;
  onRefetchFestivals: () => void;
  onRefetchTournaments?: () => void;
}

export const useCalendarContentState = ({
  fixtures,
  festivals,
  tournaments,
  onRefetchFixtures,
  onRefetchFestivals,
  onRefetchTournaments
}: UseCalendarContentStateProps) => {
  // Track processed fixtures to prevent duplications
  const processedFixtureIds = useRef(new Set<string>());
  const processedFestivalIds = useRef(new Set<string>());
  const processedTournamentIds = useRef(new Set<string>());
  
  // Add a local state to ensure we can force updates
  const [localFixtures, setLocalFixtures] = useState<any[]>([]);
  const [localFestivals, setLocalFestivals] = useState<any[]>([]);
  const [localTournaments, setLocalTournaments] = useState<any[]>([]);
  
  // Reset processed IDs when fixtures, festivals, tournaments change completely
  useEffect(() => {
    // Only reset if the length changes significantly, indicating a new dataset
    if (!fixtures || fixtures.length === 0) {
      processedFixtureIds.current.clear();
      setLocalFixtures([]);
    }
    if (!festivals || festivals.length === 0) {
      processedFestivalIds.current.clear();
      setLocalFestivals([]);
    }
    if (!tournaments || tournaments.length === 0) {
      processedTournamentIds.current.clear();
      setLocalTournaments([]);
    }
  }, [fixtures?.length, festivals?.length, tournaments?.length]);
  
  // Update fixtures state with robust deduplication
  useEffect(() => {
    if (!fixtures) {
      return;
    }

    const newFixtures = fixtures.filter(fixture => 
      !processedFixtureIds.current.has(fixture.id)
    );
    
    if (newFixtures.length > 0) {
      // Add new fixtures to the processed set
      newFixtures.forEach(fixture => {
        processedFixtureIds.current.add(fixture.id);
      });
      
      // Update state with unique fixtures
      setLocalFixtures(prev => {
        // Create a map of existing fixtures for fast lookup
        const existingMap = new Map(prev.map(f => [f.id, f]));
        
        // Add new fixtures to the map
        newFixtures.forEach(fixture => {
          existingMap.set(fixture.id, fixture);
        });
        
        // Convert map back to array
        return Array.from(existingMap.values());
      });
    }
  }, [fixtures]);
  
  // Update festivals state with robust deduplication
  useEffect(() => {
    if (!festivals) {
      return;
    }

    const newFestivals = festivals.filter(festival => 
      !processedFestivalIds.current.has(festival.id)
    );
    
    if (newFestivals.length > 0) {
      // Add new festivals to the processed set
      newFestivals.forEach(festival => {
        processedFestivalIds.current.add(festival.id);
      });
      
      // Update state with unique festivals
      setLocalFestivals(prev => {
        const existingMap = new Map(prev.map(f => [f.id, f]));
        newFestivals.forEach(festival => {
          existingMap.set(festival.id, festival);
        });
        return Array.from(existingMap.values());
      });
    }
  }, [festivals]);
  
  // Update tournaments state with robust deduplication
  useEffect(() => {
    if (!tournaments) {
      return;
    }

    const newTournaments = tournaments.filter(tournament => 
      !processedTournamentIds.current.has(tournament.id)
    );
    
    if (newTournaments.length > 0) {
      // Add new tournaments to the processed set
      newTournaments.forEach(tournament => {
        processedTournamentIds.current.add(tournament.id);
      });
      
      // Update state with unique tournaments
      setLocalTournaments(prev => {
        const existingMap = new Map(prev.map(t => [t.id, t]));
        newTournaments.forEach(tournament => {
          existingMap.set(tournament.id, tournament);
        });
        return Array.from(existingMap.values());
      });
    }
  }, [tournaments]);

  return {
    localFixtures,
    setLocalFixtures,
    localFestivals,
    setLocalFestivals,
    localTournaments,
    setLocalTournaments,
  };
};
