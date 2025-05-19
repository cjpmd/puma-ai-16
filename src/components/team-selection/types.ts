
import { Fixture } from "@/types/fixture";
import { FormationFormat } from "@/components/formation/types";

export interface TeamSelectionManagerProps {
  fixture?: Fixture;
  onSuccess?: () => void;
  // Add these properties to support FestivalDialogContent usage
  teams?: Array<{ id: string; name: string; category: string }>;
  format?: FormationFormat;
  onTeamSelectionsChange?: (selections: Record<string, any[]>) => void;
}
