import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AddEventMenu } from "./AddEventMenu";

interface CalendarHeaderProps {
  isAddMenuOpen: boolean;
  onAddMenuOpenChange: (open: boolean) => void;
  onAddFixture: () => void;
  onAddFriendly: () => void;
  onAddTournament: () => void;
  onAddFestival: () => void;
}

export const CalendarHeader = ({
  isAddMenuOpen,
  onAddMenuOpenChange,
  onAddFixture,
  onAddFriendly,
  onAddTournament,
  onAddFestival,
}: CalendarHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <div className="flex items-center gap-4">
        <AddEventMenu
          isOpen={isAddMenuOpen}
          onOpenChange={onAddMenuOpenChange}
          onAddFixture={onAddFixture}
          onAddFriendly={onAddFriendly}
          onAddTournament={onAddTournament}
          onAddFestival={onAddFestival}
        />
        <Link to="/fixtures">
          <Button variant="secondary">View Fixtures</Button>
        </Link>
      </div>
    </div>
  );
};