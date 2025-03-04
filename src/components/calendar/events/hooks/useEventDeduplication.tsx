
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
    
    const fixtureIds = new Set();
    const deduplicatedFixtures = [];
    
    // Only add each fixture once, based on its ID
    fixtures.forEach(fixture => {
      if (!fixtureIds.has(fixture.id)) {
        fixtureIds.add(fixture.id);
        deduplicatedFixtures.push(fixture);
      }
    });
    
    return deduplicatedFixtures;
  }, [fixtures]);

  // Deduplicate festivals
  const uniqueFestivals = useMemo(() => {
    if (!festivals?.length) return [];
    const festivalIds = new Set();
    const deduplicatedFestivals = [];
    
    festivals.forEach(festival => {
      if (!festivalIds.has(festival.id)) {
        festivalIds.add(festival.id);
        deduplicatedFestivals.push(festival);
      }
    });
    
    return deduplicatedFestivals;
  }, [festivals]);

  // Deduplicate tournaments
  const uniqueTournaments = useMemo(() => {
    if (!tournaments?.length) return [];
    const tournamentIds = new Set();
    const deduplicatedTournaments = [];
    
    tournaments.forEach(tournament => {
      if (!tournamentIds.has(tournament.id)) {
        tournamentIds.add(tournament.id);
        deduplicatedTournaments.push(tournament);
      }
    });
    
    return deduplicatedTournaments;
  }, [tournaments]);

  // Deduplicate sessions
  const uniqueSessions = useMemo(() => {
    if (!sessions?.length) return [];
    const sessionIds = new Set();
    const deduplicatedSessions = [];
    
    sessions.forEach(session => {
      if (!sessionIds.has(session.id)) {
        sessionIds.add(session.id);
        deduplicatedSessions.push(session);
      }
    });
    
    return deduplicatedSessions;
  }, [sessions]);

  // Calculate if there are any events
  const hasEvents = uniqueFestivals?.length || uniqueTournaments?.length || 
                   uniqueFixtures?.length || uniqueSessions?.length;

  return {
    uniqueFixtures,
    uniqueFestivals,
    uniqueTournaments,
    uniqueSessions,
    hasEvents
  };
};
