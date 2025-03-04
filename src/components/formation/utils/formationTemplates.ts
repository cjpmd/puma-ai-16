
import { FormationFormat } from "../types";

// Define position sets for 7-a-side formations
export const FORMATION_7_A_SIDE = {
  "1-1-3-1": ["GK", "DC", "DM", "ML", "MC", "MR", "STC"],
  "2-3-1": ["GK", "DL", "DR", "ML", "MC", "MR", "STC"],
  "3-2-1": ["GK", "DL", "DC", "DR", "MCL", "MCR", "STC"],
  "2-1-2-1": ["GK", "DL", "DR", "DM", "AML", "AMR", "STC"],
  "All": [] // Empty array means use all available positions
};

// Define position sets for 9-a-side formations
export const FORMATION_9_A_SIDE = {
  "3-2-3": ["GK", "DL", "DC", "DR", "MCL", "MCR", "AML", "STC", "AMR"],
  "2-4-2": ["GK", "DCL", "DCR", "ML", "MCL", "MCR", "MR", "STL", "STR"],
  "3-3-2": ["GK", "DL", "DC", "DR", "ML", "MC", "MR", "STL", "STR"],
  "3-1-3-1": ["GK", "DL", "DC", "DR", "DM", "ML", "MC", "MR", "STC"],
  "All": [] // Empty array means use all available positions
};

// Define position sets for 11-a-side formations
export const FORMATION_11_A_SIDE = {
  "4-4-2": ["GK", "DL", "DCL", "DCR", "DR", "ML", "MCL", "MCR", "MR", "STL", "STR"],
  "4-3-3": ["GK", "DL", "DCL", "DCR", "DR", "DM", "MCL", "MCR", "AML", "STC", "AMR"],
  "3-5-2": ["GK", "DCL", "DC", "DCR", "ML", "MCL", "MC", "MCR", "MR", "STL", "STR"],
  "4-2-3-1": ["GK", "DL", "DCL", "DCR", "DR", "DML", "DMR", "AML", "AMC", "AMR", "STC"],
  "All": [] // Empty array means use all available positions
};

// Get formation templates by format
export const getFormationTemplatesByFormat = (format: FormationFormat) => {
  switch (format) {
    case "5-a-side":
      return [{ name: "All", positions: [] }];
    case "7-a-side":
      return Object.keys(FORMATION_7_A_SIDE).map(name => ({
        name,
        positions: FORMATION_7_A_SIDE[name as keyof typeof FORMATION_7_A_SIDE]
      }));
    case "9-a-side":
      return Object.keys(FORMATION_9_A_SIDE).map(name => ({
        name,
        positions: FORMATION_9_A_SIDE[name as keyof typeof FORMATION_9_A_SIDE]
      }));
    case "11-a-side":
      return Object.keys(FORMATION_11_A_SIDE).map(name => ({
        name,
        positions: FORMATION_11_A_SIDE[name as keyof typeof FORMATION_11_A_SIDE]
      }));
    default:
      return [{ name: "All", positions: [] }];
  }
};

// Get positions for a specific template
export const getPositionsForTemplate = (format: FormationFormat, templateName: string): string[] => {
  if (format === "7-a-side" && templateName in FORMATION_7_A_SIDE) {
    return FORMATION_7_A_SIDE[templateName as keyof typeof FORMATION_7_A_SIDE] || [];
  } else if (format === "9-a-side" && templateName in FORMATION_9_A_SIDE) {
    return FORMATION_9_A_SIDE[templateName as keyof typeof FORMATION_9_A_SIDE] || [];
  } else if (format === "11-a-side" && templateName in FORMATION_11_A_SIDE) {
    return FORMATION_11_A_SIDE[templateName as keyof typeof FORMATION_11_A_SIDE] || [];
  }
  return [];
};
