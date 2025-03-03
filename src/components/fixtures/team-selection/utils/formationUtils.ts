
import { FormationFormat } from "@/components/formation/types";

export const getFormationFormat = (fixture: any): FormationFormat => {
  switch (fixture?.format) {
    case "5-a-side": return "5-a-side";
    case "7-a-side": return "7-a-side";
    case "9-a-side": return "9-a-side";
    case "11-a-side": return "11-a-side";
    default: return "7-a-side";
  }
};
