import { FormationFormat, FormationSlot } from "../types";
import { ALL_POSITIONS } from "../constants/positions";

// Position definitions with their visual coordinates on the pitch
const positionDefinitions: Record<string, { x: string; y: string; label: string }> = {
  // Goalkeeper
  "GK": { x: "50%", y: "5%", label: "GK" },
  
  // Defenders
  "DL": { x: "15%", y: "15%", label: "DL" },
  "DCL": { x: "35%", y: "15%", label: "DCL" },
  "DC": { x: "50%", y: "15%", label: "DC" },
  "DCR": { x: "65%", y: "15%", label: "DCR" },
  "DR": { x: "85%", y: "15%", label: "DR" },
  
  // Wing Backs
  "WBL": { x: "15%", y: "28%", label: "WBL" },
  "WBR": { x: "85%", y: "28%", label: "WBR" },
  
  // Defensive Midfielder
  "DM": { x: "50%", y: "30%", label: "DM" },
  
  // Midfielders
  "ML": { x: "15%", y: "45%", label: "ML" },
  "MCL": { x: "35%", y: "45%", label: "MCL" },
  "MC": { x: "50%", y: "45%", label: "MC" },
  "MCR": { x: "65%", y: "45%", label: "MCR" },
  "MR": { x: "85%", y: "45%", label: "MR" },
  
  // Attacking Midfielders
  "AML": { x: "25%", y: "60%", label: "AML" },
  "AMC": { x: "50%", y: "60%", label: "AMC" },
  "AMR": { x: "75%", y: "60%", label: "AMR" },
  
  // Strikers
  "STL": { x: "30%", y: "80%", label: "STL" },
  "STC": { x: "50%", y: "80%", label: "STC" },
  "STR": { x: "70%", y: "80%", label: "STR" }
};

// Generate className for positioning based on x/y percentages
const getPositionClass = (x: string, y: string): string => {
  return `left-[${x}] top-[${y}]`;
};

// Get all position slots for any formation
export const getAllPositionSlots = (): FormationSlot[] => {
  return ALL_POSITIONS.map(pos => {
    const position = positionDefinitions[pos];
    if (!position) {
      console.warn(`Position ${pos} not found in position definitions`);
      return null;
    }
    
    return {
      id: pos,
      label: position.label,
      className: getPositionClass(position.x, position.y)
    };
  }).filter(Boolean) as FormationSlot[];
};

// Get specific formation slots based on format
export const getFormationSlots = (format: FormationFormat): FormationSlot[] => {
  let positions: string[] = [];
  
  switch (format) {
    case "5-a-side":
      positions = ["GK", "DL", "DR", "STC", "STR"];
      break;
    case "7-a-side":
      positions = ["GK", "DL", "DC", "DR", "MC", "STL", "STC"];
      break;
    case "9-a-side":
      positions = ["GK", "DL", "DCL", "DCR", "DR", "MC", "AMC", "STL", "STC"];
      break;
    case "11-a-side":
      positions = ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "AML", "STC", "AMR"];
      break;
    default:
      positions = ["GK", "DL", "DC", "DR", "MC", "STL", "STC"];
  }
  
  // Filter the positions to only include the ones we want for this formation
  return positions.map(pos => {
    const position = positionDefinitions[pos];
    if (!position) {
      console.warn(`Position ${pos} not found in position definitions`);
      return null;
    }
    
    return {
      id: pos,
      label: position.label,
      className: getPositionClass(position.x, position.y)
    };
  }).filter(Boolean) as FormationSlot[];
};

// Helper function to get positions for a specific line (e.g., defense, midfield)
export const getPositionsInLine = (line: 'defense' | 'midfield' | 'attack'): string[] => {
  switch (line) {
    case 'defense':
      return ["DL", "DCL", "DC", "DCR", "DR", "WBL", "WBR"];
    case 'midfield':
      return ["DM", "ML", "MCL", "MC", "MCR", "MR", "AML", "AMC", "AMR"];
    case 'attack':
      return ["STL", "STC", "STR"];
    default:
      return [];
  }
};

export const formatSelectionsForFormation = (selections: Record<string, { playerId: string; position: string }>) => {
  return Object.entries(selections)
    .filter(([slotId, value]) => value.playerId !== "unassigned" && !slotId.startsWith('sub-'))
    .map(([_, value]) => {
      return {
        position: value.position,
        playerId: value.playerId
      };
    });
};
