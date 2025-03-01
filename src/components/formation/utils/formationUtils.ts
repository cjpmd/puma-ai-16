
import { FormationFormat, FormationSlot } from "../types";

export const getFormationSlots = (format: FormationFormat): FormationSlot[] => {
  switch (format) {
    case "5-a-side":
      return [
        { id: "gk-1", label: "GK", className: "w-full" },
        { id: "def-1", label: "DL", className: "w-full" },
        { id: "def-2", label: "DC", className: "w-full" },
        { id: "def-3", label: "DR", className: "w-full" },
        { id: "str-1", label: "STC", className: "w-full" },
      ];
    case "7-a-side":
      return [
        { id: "gk-1", label: "GK", className: "w-full" },
        { id: "def-1", label: "DL", className: "w-full" },
        { id: "def-2", label: "DC", className: "w-full" },
        { id: "def-3", label: "DR", className: "w-full" },
        { id: "mid-1", label: "MC", className: "w-full" },
        { id: "str-1", label: "STC", className: "w-full" },
        { id: "str-2", label: "AMC", className: "w-full" },
      ];
    case "9-a-side":
      return [
        { id: "gk-1", label: "GK", className: "w-full" },
        { id: "def-1", label: "DL", className: "w-full" },
        { id: "def-2", label: "DC", className: "w-full" },
        { id: "def-3", label: "DR", className: "w-full" },
        { id: "mid-1", label: "ML", className: "w-full" },
        { id: "mid-2", label: "MC", className: "w-full" },
        { id: "mid-3", label: "MR", className: "w-full" },
        { id: "str-1", label: "AMC", className: "w-full" },
        { id: "str-2", label: "STC", className: "w-full" },
      ];
    case "11-a-side":
      return [
        { id: "gk-1", label: "GK", className: "w-full" },
        { id: "def-1", label: "DL", className: "w-full" },
        { id: "def-2", label: "DCL", className: "w-full" },
        { id: "def-3", label: "DC", className: "w-full" },
        { id: "def-4", label: "DR", className: "w-full" },
        { id: "mid-1", label: "ML", className: "w-full" },
        { id: "mid-2", label: "MCL", className: "w-full" },
        { id: "mid-3", label: "MC", className: "w-full" },
        { id: "mid-4", label: "MR", className: "w-full" },
        { id: "str-1", label: "AMC", className: "w-full" },
        { id: "str-2", label: "STC", className: "w-full" },
      ];
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
