
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
    if (!fixtures || !fixtures.length) return [];
    
    console.log("Raw fixture IDs in EventsList:", fixtures?.map(f => f.id));
    
    // Use a Map to get unique fixtures by ID
    const fixturesMap = new Map();
    
    fixtures.forEach(fixture => {
      if (!fixturesMap.has(fixture.id)) {
        fixturesMap.set(fixture.id, fixture);
      }
    });
    
    const result = Array.from(fixturesMap.values());
    console.log("EventsList rendering fixtures:", result.map(f => f.id));
    return result;
  }, [fixtures]);

  // Deduplicate festivals
  const uniqueFestivals = useMemo(() => {
    if (!festivals || !festivals.length) return [];
    
    const festivalMap = new Map();
    
    festivals.forEach(festival => {
      if (!festivalMap.has(festival.id)) {
        festivalMap.set(festival.id, festival);
      }
    });
    
    const result = Array.from(festivalMap.values());
    console.log("EventsList rendering festivals:", result.length);
    return result;
  }, [festivals]);

  // Deduplicate tournaments
  const uniqueTournaments = useMemo(() => {
    if (!tournaments || !tournaments.length) return [];
    
    const tournamentMap = new Map();
    
    tournaments.forEach(tournament => {
      if (!tournamentMap.has(tournament.id)) {
        tournamentMap.set(tournament.id, tournament);
      }
    });
    
    const result = Array.from(tournamentMap.values());
    console.log("EventsList rendering tournaments:", result.length);
    return result;
  }, [tournaments]);

  // Deduplicate sessions
  const uniqueSessions = useMemo(() => {
    if (!sessions || !sessions.length) return [];
    
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
