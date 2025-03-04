
import { useMemo } from "react";
import type { Fixture } from "@/types/fixture";

/**
 * Hook to deduplicate different types of calendar events by their IDs
 */
export const useEventDeduplication = ({
  fixtures,
  festivals,
  tournaments,
  sessions,
}: {
  fixtures?: Fixture[];
  festivals?: any[];
  tournaments?: any[];
  sessions?: any[];
}) => {
  // Deduplicate fixtures by ID
  const uniqueFixtures = useMemo(() => {
    if (!fixtures?.length) return [];
    
    // Use a Map instead of a Set to maintain only one instance of each fixture by ID
    const fixtureMap = new Map();
    
    // Only add each fixture once, based on its ID
    fixtures.forEach(fixture => {
      // If the fixture ID isn't in the map yet, add it
      if (!fixtureMap.has(fixture.id)) {
        fixtureMap.set(fixture.id, fixture);
      }
    });
    
    // Convert the Map values to an array
    return Array.from(fixtureMap.values());
  }, [fixtures]);

  // Deduplicate festivals
  const uniqueFestivals = useMemo(() => {
    if (!festivals?.length) return [];
    
    const festivalMap = new Map();
    
    festivals.forEach(festival => {
      if (!festivalMap.has(festival.id)) {
        festivalMap.set(festival.id, festival);
      }
    });
    
    return Array.from(festivalMap.values());
  }, [festivals]);

  // Deduplicate tournaments
  const uniqueTournaments = useMemo(() => {
    if (!tournaments?.length) return [];
    
    const tournamentMap = new Map();
    
    tournaments.forEach(tournament => {
      if (!tournamentMap.has(tournament.id)) {
        tournamentMap.set(tournament.id, tournament);
      }
    });
    
    return Array.from(tournamentMap.values());
  }, [tournaments]);

  // Deduplicate sessions
  const uniqueSessions = useMemo(() => {
    if (!sessions?.length) return [];
    
    const sessionMap = new Map();
    
    sessions.forEach(session => {
      if (!sessionMap.has(session.id)) {
        sessionMap.set(session.id, session);
      }
    });
    
    return Array.from(sessionMap.values());
  }, [sessions]);

  // Calculate if there are any events
  const hasEvents = uniqueFixtures.length > 0 || 
                   uniqueFestivals.length > 0 || 
                   uniqueTournaments.length > 0 || 
                   uniqueSessions.length > 0;

  return {
    uniqueFixtures,
    uniqueFestivals,
    uniqueTournaments,
    uniqueSessions,
    hasEvents
  };
};
