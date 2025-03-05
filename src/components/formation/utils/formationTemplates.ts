
import { FormationFormat } from "../types";

// Formation templates for 7-a-side
export const FORMATION_7_A_SIDE = {
  "1-1-3-1": ["GK", "DC", "DM", "AML", "AMC", "AMR", "STC"],
  "2-3-1": ["GK", "DL", "DR", "ML", "MC", "MR", "STC"],
  "3-2-1": ["GK", "DL", "DC", "DR", "MCL", "MCR", "STC"],
  "All": ["GK", "DL", "DC", "DR", "ML", "MC", "MR", "STC"],
};

// Formation templates for 9-a-side
export const FORMATION_9_A_SIDE = {
  "3-2-3": ["GK", "DL", "DC", "DR", "MCL", "MCR", "AMC", "STL", "STR"],
  "2-4-2": ["GK", "DCL", "DCR", "DM", "ML", "MR", "AMC", "STC"],
  "3-3-2": ["GK", "DL", "DC", "DR", "ML", "MC", "MR", "STL", "STR"],
  "All": ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "STC"],
};

// Formation templates for 11-a-side
export const FORMATION_11_A_SIDE = {
  "4-4-2": ["GK", "DL", "DCL", "DCR", "DR", "ML", "MCL", "MCR", "MR", "STCL", "STCR"],
  "4-3-3": ["GK", "DL", "DCL", "DCR", "DR", "ML", "MC", "MR", "AML", "STC", "AMR"],
  "4-2-3-1": ["GK", "DL", "DCL", "DCR", "DR", "DMCL", "DMCR", "AML", "AMC", "AMR", "STC"],
  "3-5-2": ["GK", "DCL", "DC", "DCR", "ML", "MCL", "MC", "MCR", "MR", "STCL", "STCR"],
  "5-3-2": ["GK", "WBL", "DCL", "DC", "DCR", "WBR", "MCL", "MC", "MCR", "STCL", "STCR"],
};

// Formation templates for 5-a-side
export const FORMATION_5_A_SIDE = {
  "1-2-1": ["GK", "DC", "ML", "MR", "STC"],
  "2-1-1": ["GK", "DL", "DR", "MC", "STC"],
  "1-1-2": ["GK", "DC", "MC", "STCL", "STCR"],
  "All": ["GK", "DL", "DC", "DR", "ML", "MC", "MR", "STC"],
};

// Returns formation templates based on format
export const getFormationTemplatesByFormat = (format: FormationFormat): Record<string, string[]> => {
  switch (format) {
    case "5-a-side":
      return FORMATION_5_A_SIDE;
    case "7-a-side":
      return FORMATION_7_A_SIDE;
    case "9-a-side":
      return FORMATION_9_A_SIDE;
    case "11-a-side":
      return FORMATION_11_A_SIDE;
    default:
      return {};
  }
};

// Get positions for a specific template
export const getPositionsForTemplate = (
  format: FormationFormat,
  template: string
): string[] => {
  const templates = getFormationTemplatesByFormat(format);
  return templates[template] || [];
};
