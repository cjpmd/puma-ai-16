
import { DateChangeButton } from "../events/components/DateChangeButton";
import { EventActionButtons } from "../events/components/EventActionButtons";

interface FixtureFooterProps {
  fixtureId: string;
  fixtureDate: string | undefined;
  onEdit: () => void;
  onTeamSelection: () => void;
  onDelete: () => void;
  onDateChange: (fixtureId: string, newDate: Date) => void;
}

export const FixtureFooter = ({
  fixtureId,
  fixtureDate,
  onEdit,
  onTeamSelection,
  onDelete,
  onDateChange
}: FixtureFooterProps) => {
  return (
    <div className="flex justify-end items-center gap-2 mt-4">
      <DateChangeButton 
        date={fixtureDate ? new Date(fixtureDate) : new Date()} 
        onDateChange={(newDate) => {
          // Convert Date to string format before passing to parent component
          onDateChange(fixtureId, newDate);
        }}
      />
      <EventActionButtons 
        onEdit={onEdit}
        onTeamSelection={onTeamSelection} 
        onDelete={onDelete} 
      />
    </div>
  );
};
