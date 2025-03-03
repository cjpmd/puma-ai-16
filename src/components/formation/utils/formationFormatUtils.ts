
import { FormationFormat, FormationSlot } from "../types";
import { ALL_POSITIONS } from "../constants/positions";
import { positionDefinitions, getPositionClass } from "./positionDefinitions";

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
