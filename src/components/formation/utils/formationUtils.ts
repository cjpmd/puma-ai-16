import { FormationFormat, FormationSlot } from "../types";

/**
 * Get formation slots based on formation format
 */
export function getFormationSlots(format: FormationFormat): FormationSlot[] {
  switch (format) {
    case "11-a-side":
      return [
        // Strikers
        { id: "STL", label: "STL", className: "top-[15%] left-[25%] -translate-x-1/2 -translate-y-1/2" },
        { id: "STC", label: "STC", className: "top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "STR", label: "STR", className: "top-[15%] right-[25%] -translate-x-1/2 -translate-y-1/2" },
        
        // Attacking midfielders
        { id: "AML", label: "AML", className: "top-[35%] left-[25%] -translate-x-1/2 -translate-y-1/2" },
        { id: "AMC", label: "AMC", className: "top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "AMR", label: "AMR", className: "top-[35%] right-[25%] -translate-x-1/2 -translate-y-1/2" },
        
        // Central midfielders
        { id: "ML", label: "ML", className: "top-1/2 left-[25%] -translate-x-1/2 -translate-y-1/2" },
        { id: "MCL", label: "MCL", className: "top-1/2 left-[37%] -translate-x-1/2 -translate-y-1/2" },
        { id: "MC", label: "MC", className: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "MCR", label: "MCR", className: "top-1/2 right-[37%] -translate-x-1/2 -translate-y-1/2" },
        { id: "MR", label: "MR", className: "top-1/2 right-[25%] -translate-x-1/2 -translate-y-1/2" },
        
        // Defensive midfielders & wingbacks
        { id: "WBL", label: "WBL", className: "bottom-[35%] left-[15%] -translate-x-1/2 -translate-y-1/2" },
        { id: "DM", label: "DM", className: "bottom-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "WBR", label: "WBR", className: "bottom-[35%] right-[15%] -translate-x-1/2 -translate-y-1/2" },
        
        // Defenders
        { id: "DL", label: "DL", className: "bottom-[20%] left-[15%] -translate-x-1/2 -translate-y-1/2" },
        { id: "DCL", label: "DCL", className: "bottom-[20%] left-[32%] -translate-x-1/2 -translate-y-1/2" },
        { id: "DC", label: "DC", className: "bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "DCR", label: "DCR", className: "bottom-[20%] right-[32%] -translate-x-1/2 -translate-y-1/2" },
        { id: "DR", label: "DR", className: "bottom-[20%] right-[15%] -translate-x-1/2 -translate-y-1/2" },
        
        // Goalkeeper
        { id: "GK", label: "GK", className: "bottom-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
      ];
    case "9-a-side":
      return [
        // Strikers
        { id: "STL", label: "STL", className: "top-[15%] left-[25%] -translate-x-1/2 -translate-y-1/2" },
        { id: "STC", label: "STC", className: "top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "STR", label: "STR", className: "top-[15%] right-[25%] -translate-x-1/2 -translate-y-1/2" },
        
        // Midfielders
        { id: "ML", label: "ML", className: "top-[35%] left-[25%] -translate-x-1/2 -translate-y-1/2" },
        { id: "MC", label: "MC", className: "top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "MR", label: "MR", className: "top-[35%] right-[25%] -translate-x-1/2 -translate-y-1/2" },
        
        // Defenders
        { id: "DL", label: "DL", className: "bottom-[20%] left-[25%] -translate-x-1/2 -translate-y-1/2" },
        { id: "DC", label: "DC", className: "bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "DR", label: "DR", className: "bottom-[20%] right-[25%] -translate-x-1/2 -translate-y-1/2" },
        
        // Goalkeeper
        { id: "GK", label: "GK", className: "bottom-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
      ];
    case "7-a-side":
      return [
        // Strikers
        { id: "STL", label: "STL", className: "top-[15%] left-[30%] -translate-x-1/2 -translate-y-1/2" },
        { id: "STC", label: "STC", className: "top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        { id: "STR", label: "STR", className: "top-[15%] right-[30%] -translate-x-1/2 -translate-y-1/2" },
        
        // Midfielders
        { id: "ML", label: "ML", className: "top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2" },
        { id: "MR", label: "MR", className: "top-1/2 right-[30%] -translate-x-1/2 -translate-y-1/2" },
        
        // Defender
        { id: "DC", label: "DC", className: "bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        
        // Goalkeeper
        { id: "GK", label: "GK", className: "bottom-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
      ];
    case "5-a-side":
    default:
      return [
        // Strikers
        { id: "STL", label: "STL", className: "top-[20%] left-[30%] -translate-x-1/2 -translate-y-1/2" },
        { id: "STR", label: "STR", className: "top-[20%] right-[30%] -translate-x-1/2 -translate-y-1/2" },
        
        // Midfielder
        { id: "MC", label: "MC", className: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
        
        // Defender
        { id: "DC", label: "DC", className: "bottom-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
        
        // Goalkeeper
        { id: "GK", label: "GK", className: "bottom-[5%] left-1/2 -translate-x-1/2 -translate-y-1/2" },
      ];
  }
}

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
