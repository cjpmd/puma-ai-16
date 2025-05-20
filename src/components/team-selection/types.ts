
import { FormationFormat } from "@/components/formation/types";
import { Fixture } from "@/types/fixture";
import { PerformanceCategory } from "@/types/player";

export interface TeamSelectionManagerProps {
  fixture?: Fixture;
  onSuccess?: () => void;
  teams?: { id: string; name: string; category: string; }[];
  format?: FormationFormat;
  onTeamSelectionsChange?: (selections: any) => void;
  // Add performanceCategory prop to fix the error
  performanceCategory?: PerformanceCategory;
}

export interface TeamCaptains {
  [teamId: string]: string;
}

export interface TeamSelection {
  playerId: string;
  position: string;
  performanceCategory?: PerformanceCategory;
  isSubstitution?: boolean;
}

export interface TeamSelectionsByPeriod {
  [periodId: string]: {
    [positionKey: string]: TeamSelection;
  };
}

export interface FormationTemplates {
  [key: string]: {
    name: string;
    positions: string[];
  };
}

export interface TeamSelectionPeriod {
  id: string;
  period_number: number;
  duration_minutes: number;
  team_id?: string;
  formation_template?: string;
}
