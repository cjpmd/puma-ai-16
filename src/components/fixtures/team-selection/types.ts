
import { Fixture } from "@/types/fixture";

export interface TeamSelectionManagerProps {
  fixture: Fixture | null;
  onSuccess?: () => void;
}

export interface TeamSelection {
  playerId: string;
  position: string;
  performanceCategory?: string;
  isSubstitution?: boolean;
}

export interface TeamSelections {
  [slotId: string]: TeamSelection;
}

export interface PeriodSelections {
  [teamId: string]: TeamSelections;
}

export interface AllSelections {
  [periodId: string]: PeriodSelections;
}

export interface Period {
  id: string;
  duration: number;
}

export interface PeriodsPerTeam {
  [teamId: string]: Period[];
}

export interface PerformanceCategories {
  [key: string]: string;
}

export interface TeamCaptains {
  [teamId: string]: string;
}
