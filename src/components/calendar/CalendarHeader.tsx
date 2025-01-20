import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AddSessionDialog } from "@/components/training/AddSessionDialog";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { AddTournamentDialog } from "@/components/calendar/AddTournamentDialog";
import { AddFestivalDialog } from "@/components/calendar/AddFestivalDialog";

interface CalendarHeaderProps {
  isAddSessionOpen: boolean;
  setIsAddSessionOpen: (open: boolean) => void;
  isAddFixtureOpen: boolean;
  setIsAddFixtureOpen: (open: boolean) => void;
  isAddTournamentOpen: boolean;
  setIsAddTournamentOpen: (open: boolean) => void;
  isAddFestivalOpen: boolean;
  setIsAddFestivalOpen: (open: boolean) => void;
  sessionTitle: string;
  setSessionTitle: (title: string) => void;
  handleAddSession: () => void;
  setEditingFixture: (fixture: any) => void;
}

export const CalendarHeader = ({
  isAddSessionOpen,
  setIsAddSessionOpen,
  isAddFixtureOpen,
  setIsAddFixtureOpen,
  isAddTournamentOpen,
  setIsAddTournamentOpen,
  isAddFestivalOpen,
  setIsAddFestivalOpen,
  sessionTitle,
  setSessionTitle,
  handleAddSession,
  setEditingFixture,
}: CalendarHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Calendar</h1>
      <div className="flex items-center gap-4">
        <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Training
            </Button>
          </DialogTrigger>
          <AddSessionDialog
            isOpen={isAddSessionOpen}
            onOpenChange={setIsAddSessionOpen}
            title={sessionTitle}
            onTitleChange={setSessionTitle}
            onAdd={handleAddSession}
          />
        </Dialog>
        <Dialog open={isAddFixtureOpen} onOpenChange={setIsAddFixtureOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fixture
            </Button>
          </DialogTrigger>
          <AddFixtureDialog 
            isOpen={isAddFixtureOpen}
            onOpenChange={setIsAddFixtureOpen}
            selectedDate={new Date()}
            onSuccess={() => {
              setIsAddFixtureOpen(false);
              setEditingFixture(null);
            }}
          />
        </Dialog>
        <Dialog open={isAddTournamentOpen} onOpenChange={setIsAddTournamentOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Tournament
            </Button>
          </DialogTrigger>
          <AddTournamentDialog
            isOpen={isAddTournamentOpen}
            onOpenChange={setIsAddTournamentOpen}
            selectedDate={new Date()}
            onSuccess={() => {
              setIsAddTournamentOpen(false);
            }}
          />
        </Dialog>
        <Dialog open={isAddFestivalOpen} onOpenChange={setIsAddFestivalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Festival
            </Button>
          </DialogTrigger>
          <AddFestivalDialog
            isOpen={isAddFestivalOpen}
            onOpenChange={setIsAddFestivalOpen}
            selectedDate={new Date()}
            onSuccess={() => {
              setIsAddFestivalOpen(false);
            }}
          />
        </Dialog>
        <Link to="/fixtures">
          <Button variant="secondary">
            View Fixtures
          </Button>
        </Link>
      </div>
    </div>
  );
};