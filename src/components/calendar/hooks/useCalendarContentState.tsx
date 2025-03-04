
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
  
  // Update local state when props change
  useEffect(() => {
    // Ensure we deduplicate fixtures by ID here as well
    const uniqueFixturesMap = new Map();
    fixtures?.forEach(fixture => {
      if (!uniqueFixturesMap.has(fixture.id)) {
        uniqueFixturesMap.set(fixture.id, fixture);
      }
    });
    setLocalFixtures(Array.from(uniqueFixturesMap.values()));
    
    // Do the same for festivals and tournaments
    const uniqueFestivalsMap = new Map();
    festivals?.forEach(festival => {
      if (!uniqueFestivalsMap.has(festival.id)) {
        uniqueFestivalsMap.set(festival.id, festival);
      }
    });
    setLocalFestivals(Array.from(uniqueFestivalsMap.values()));
    
    const uniqueTournamentsMap = new Map();
    tournaments?.forEach(tournament => {
      if (!uniqueTournamentsMap.has(tournament.id)) {
        uniqueTournamentsMap.set(tournament.id, tournament);
      }
    });
    setLocalTournaments(Array.from(uniqueTournamentsMap.values()));
  }, [fixtures, festivals, tournaments]);

  return {
    localFixtures,
    setLocalFixtures,
    localFestivals,
    setLocalFestivals,
    localTournaments,
    setLocalTournaments,
  };
};
