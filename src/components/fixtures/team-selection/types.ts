
import { Fixture } from "@/types/fixture";
import { PerformanceCategory } from "@/types/player";

export interface TeamSelectionManagerProps {
  fixture?: Fixture;
  onSuccess?: () => void;
}

// Define the structure for team selections
export interface TeamSelection {
  playerId: string;
  position: string;
  performanceCategory?: PerformanceCategory;
}

// Team selections organized by position key
export interface TeamSelections {
  [positionKey: string]: TeamSelection;
}

// All selections organized by team and period
export interface AllSelections {
  [teamId: string]: {
    [periodKey: string]: TeamSelections;
  };
}

// Structure for tracking periods per team
export interface PeriodsPerTeam {
  [teamId: string]: {
    periods: number;
    durations: number[];
  };
}

// Structure for tracking team captains
export interface TeamCaptains {
  [teamId: string]: string; // playerId
}

// Structure for tracking performance categories for each team
export interface PerformanceCategories {
  [teamId: string]: PerformanceCategory;
}

// TeamFormData for form submission
export interface TeamFormData {
  team_id: string;
  fixture_id: string;
  performance_category?: PerformanceCategory;
  player_selections: {
    player_id: string;
    position: string;
    is_substitute: boolean;
    period_number: number;
  }[];
  captain_id?: string;
}
