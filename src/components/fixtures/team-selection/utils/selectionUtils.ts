
// Utility functions for handling selections

import { AllSelections } from "../types";

// Extract all selected players across all periods and teams
export const extractSelectedPlayers = (selections: AllSelections): Set<string> => {
  const selectedPlayers = new Set<string>();
  
  Object.values(selections).forEach(periodSelections => {
    Object.values(periodSelections).forEach(teamSelections => {
      Object.values(teamSelections).forEach(selection => {
        if (selection.playerId && selection.playerId !== "unassigned") {
          selectedPlayers.add(selection.playerId);
        }
      });
    });
  });
  
  return selectedPlayers;
};

// Map from database position to formation slot ID
export const mapPositionToSlot = (position: string): string => {
  // Strip any whitespace and convert to uppercase for consistency
  const cleanPosition = position?.trim().toUpperCase() || '';
  
  // Map of standard positions to slot IDs
  const positionMap: Record<string, string> = {
    'GK': 'GK',
    'DL': 'DL',
    'DCL': 'DCL',
    'DC': 'DC',
    'DCR': 'DCR',
    'DR': 'DR',
    'ML': 'ML',
    'MC': 'MC',
    'MR': 'MR',
    'MCL': 'MCL',
    'MCR': 'MCR',
    'ST': 'ST',
    'STL': 'STL',
    'STR': 'STR',
    'SUB1': 'SUB1',
    'SUB2': 'SUB2',
    'SUB3': 'SUB3',
    'SUB4': 'SUB4',
    'SUB5': 'SUB5',
  };
  
  // If we have a direct match, return it
  if (positionMap[cleanPosition]) {
    return positionMap[cleanPosition];
  }
  
  // Otherwise, return the position as the slot ID (will be inserted as-is)
  return cleanPosition;
};

// Map from formation slot ID to database position
export const mapSlotToPosition = (slotId: string): string => {
  // For now, we'll use the slot ID directly as the position
  return slotId;
};

// Convert the selections to a simplified format for direct comparison
export const simplifySelections = (selections: AllSelections): string => {
  return JSON.stringify(
    Object.entries(selections).map(([periodId, periodData]) => ({
      periodId,
      teams: Object.entries(periodData).map(([teamId, teamData]) => ({
        teamId,
        positions: Object.entries(teamData).map(([position, data]) => ({
          position,
          playerId: data.playerId
        }))
      }))
    }))
  );
};
