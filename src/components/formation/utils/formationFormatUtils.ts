
import { FormationFormat, FormationSlot } from "../types";
import { ALL_POSITIONS } from "../constants/positions";
import { positionDefinitions, getPositionClass } from "./positionDefinitions";
import { 
  getFormationTemplatesByFormat as getTemplatesFromFormations, 
  getPositionsForTemplate 
} from "./formationTemplates";

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

// Get specific formation slots based on format and template
export const getFormationSlots = (format: FormationFormat, template?: string): FormationSlot[] => {
  let positions: string[] = [];
  
  console.log(`Getting formation slots for format: ${format}, template: ${template}`);
  
  // If template is specified and not "All", use it
  if (template && template !== "All") {
    positions = getPositionsForTemplate(format, template);
    console.log(`Got positions from template: ${positions.join(', ')}`);
    if (positions.length > 0) {
      return createSlotsFromPositions(positions);
    }
  }
  
  // Otherwise use default positions
  switch (format) {
    case "5-a-side":
      positions = ["GK", "DL", "DR", "MC", "STC"];
      break;
    case "7-a-side":
      positions = ["GK", "DL", "DC", "DR", "ML", "MC", "MR"];
      break;
    case "9-a-side":
      positions = ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "STC"];
      break;
    case "11-a-side":
      positions = ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "AML", "STC", "AMR"];
      break;
    default:
      positions = ["GK", "DL", "DC", "DR", "ML", "MC", "MR"];
  }
  
  console.log(`Using default positions for format ${format}: ${positions.join(', ')}`);
  return createSlotsFromPositions(positions);
};

// Create slots from position codes
function createSlotsFromPositions(positions: string[]): FormationSlot[] {
  // Filter the positions to only include the ones we want for this formation
  const slots = positions.map(pos => {
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
  
  console.log(`Created ${slots.length} slots from positions`);
  return slots;
}

// Re-export the template functions with a different name to avoid conflicts
export const getFormationTemplatesForFormat = getTemplatesFromFormations;
