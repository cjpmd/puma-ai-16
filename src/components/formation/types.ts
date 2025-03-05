
export type FormationFormat = "5-a-side" | "7-a-side" | "9-a-side" | "11-a-side";
export type ViewMode = "team-sheet" | "formation";

export interface FormationSlot {
  id: string;
  label: string;
  className: string;
}

export interface PlayerSelection {
  playerId: string;
  position: string;
  performanceCategory?: string;
}

export interface FormationSelectionProps {
  format: FormationFormat;
  teamName: string;
  onSelectionChange: (selections: Record<string, PlayerSelection>) => void;
  selectedPlayers: Set<string>;
  availablePlayers?: Array<{ id: string; name: string; squad_number?: number }>;
  performanceCategory?: string;
  initialSelections?: Record<string, PlayerSelection>;
  viewMode?: ViewMode;
  duration?: number;
  periodNumber?: number;
  formationTemplate?: string;
}
