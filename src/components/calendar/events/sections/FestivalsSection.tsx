
import { FestivalEvent } from "../FestivalEvent";

interface FestivalsSectionProps {
  festivals: any[];
  onEditFestival?: (festival: any) => void;
  onDeleteFestival?: (festivalId: string) => void;
  onTeamSelectionFestival?: (festival: any) => void;
  onDateChange?: (festivalId: string, newDate: Date) => void;
}

export const FestivalsSection = ({
  festivals,
  onEditFestival,
  onDeleteFestival,
  onTeamSelectionFestival,
  onDateChange,
}: FestivalsSectionProps) => {
  if (!festivals.length) return null;

  return (
    <>
      {festivals.map((festival) => (
        <FestivalEvent
          key={festival.id}
          festival={festival}
          onEdit={onEditFestival}
          onTeamSelection={onTeamSelectionFestival}
          onDelete={onDeleteFestival}
          onDateChange={onDateChange}
        />
      ))}
    </>
  );
};
