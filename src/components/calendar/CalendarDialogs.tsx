import { Dialog } from "@/components/ui/dialog";
import { AddFixtureDialog } from "./AddFixtureDialog";
import { AddFestivalDialog } from "./AddFestivalDialog";
import { EditObjectiveDialog } from "./EditObjectiveDialog";
import type { Fixture } from "@/types/fixture";

interface CalendarDialogsProps {
  date: Date;
  isAddFixtureOpen: boolean;
  setIsAddFixtureOpen: (open: boolean) => void;
  isAddFriendlyOpen: boolean;
  setIsAddFriendlyOpen: (open: boolean) => void;
  isAddFestivalOpen: boolean;
  setIsAddFestivalOpen: (open: boolean) => void;
  isTeamSelectionOpen: boolean;
  setIsTeamSelectionOpen: (open: boolean) => void;
  editingFixture: Fixture | null;
  setEditingFixture: (fixture: Fixture | null) => void;
  editingFestival: any;
  setEditingFestival: (festival: any) => void;
  onRefetchFixtures: () => void;
  onRefetchFestivals: () => void;
}

export const CalendarDialogs = ({
  date,
  isAddFixtureOpen,
  setIsAddFixtureOpen,
  isAddFriendlyOpen,
  setIsAddFriendlyOpen,
  isAddFestivalOpen,
  setIsAddFestivalOpen,
  isTeamSelectionOpen,
  setIsTeamSelectionOpen,
  editingFixture,
  setEditingFixture,
  editingFestival,
  setEditingFestival,
  onRefetchFixtures,
  onRefetchFestivals,
}: CalendarDialogsProps) => {
  return (
    <>
      <Dialog open={isAddFixtureOpen} onOpenChange={setIsAddFixtureOpen}>
        <AddFixtureDialog
          isOpen={isAddFixtureOpen}
          onOpenChange={setIsAddFixtureOpen}
          selectedDate={date}
          onSuccess={() => {
            onRefetchFixtures();
            setIsAddFixtureOpen(false);
            setEditingFixture(null);
          }}
          editingFixture={editingFixture}
        />
      </Dialog>

      <Dialog
        open={isAddFestivalOpen || isTeamSelectionOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddFestivalOpen(false);
            setIsTeamSelectionOpen(false);
            setEditingFestival(null);
          }
        }}
      >
        <AddFestivalDialog
          isOpen={isAddFestivalOpen || isTeamSelectionOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddFestivalOpen(false);
              setIsTeamSelectionOpen(false);
              setEditingFestival(null);
            }
          }}
          selectedDate={date}
          onSuccess={() => {
            onRefetchFestivals();
            setIsAddFestivalOpen(false);
            setIsTeamSelectionOpen(false);
            setEditingFestival(null);
          }}
          editingFestival={editingFestival}
          showTeamSelection={isTeamSelectionOpen}
        />
      </Dialog>

      <Dialog open={isAddFriendlyOpen} onOpenChange={setIsAddFriendlyOpen}>
        <AddFixtureDialog
          isOpen={isAddFriendlyOpen}
          onOpenChange={setIsAddFriendlyOpen}
          selectedDate={date}
          onSuccess={() => {
            onRefetchFixtures();
            setIsAddFriendlyOpen(false);
          }}
          showDateSelector
        />
      </Dialog>
    </>
  );
};