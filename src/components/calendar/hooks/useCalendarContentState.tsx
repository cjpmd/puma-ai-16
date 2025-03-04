
import { useState, useEffect } from "react";

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
  // Add a local state to ensure we can force updates
  const [localFixtures, setLocalFixtures] = useState(fixtures);
  const [localFestivals, setLocalFestivals] = useState(festivals);
  const [localTournaments, setLocalTournaments] = useState(tournaments);
  
  // Update local state when props change - with improved deduplication
  useEffect(() => {
    if (!fixtures) {
      setLocalFixtures([]);
      return;
    }

    // Create a Map to deduplicate fixtures by ID
    const uniqueFixturesMap = new Map();
    fixtures.forEach(fixture => {
      if (!uniqueFixturesMap.has(fixture.id)) {
        uniqueFixturesMap.set(fixture.id, fixture);
      }
    });
    setLocalFixtures(Array.from(uniqueFixturesMap.values()));
    
  }, [fixtures]);
  
  // Update festivals state with deduplication
  useEffect(() => {
    if (!festivals) {
      setLocalFestivals([]);
      return;
    }

    const uniqueFestivalsMap = new Map();
    festivals.forEach(festival => {
      if (!uniqueFestivalsMap.has(festival.id)) {
        uniqueFestivalsMap.set(festival.id, festival);
      }
    });
    setLocalFestivals(Array.from(uniqueFestivalsMap.values()));
    
  }, [festivals]);
  
  // Update tournaments state with deduplication
  useEffect(() => {
    if (!tournaments) {
      setLocalTournaments([]);
      return;
    }

    const uniqueTournamentsMap = new Map();
    tournaments.forEach(tournament => {
      if (!uniqueTournamentsMap.has(tournament.id)) {
        uniqueTournamentsMap.set(tournament.id, tournament);
      }
    });
    setLocalTournaments(Array.from(uniqueTournamentsMap.values()));
    
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
