
import { AllSelections } from "../types";

// Helper function to map DB position to UI slot
export const mapPositionToSlot = (position: string) => {
  const positionToSlotMap: Record<string, string> = {
    'GK': 'gk-1',
    'DL': 'def-1',
    'DC': 'def-2',
    'DCL': 'def-2', // Map both DC and DCL to def-2
    'DCR': 'def-3', // Map DCR to def-3
    'DR': 'def-3',
    'MC': 'mid-1',
    'AMC': 'str-2',
    'STC': 'str-1',
    'AML': 'mid-2',
    'AMR': 'mid-3',
    'ML': 'mid-2',
    'MR': 'mid-3'
  };
  
  return positionToSlotMap[position] || `pos-${Math.random()}`;
};

// Extract selected players from all selections
export const extractSelectedPlayers = (selectionsData: AllSelections) => {
  const selectedPlayers = new Set<string>();
  
  Object.values(selectionsData).forEach(periodSelections => {
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
