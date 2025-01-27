import { Dialog } from "@/components/ui/dialog";
import { AddFixtureDialog } from "./AddFixtureDialog";
import { AddFestivalDialog } from "./AddFestivalDialog";
import { AddTournamentDialog } from "./AddTournamentDialog";
import type { Fixture } from "@/types/fixture";

interface CalendarDialogsProps {
  date: Date;
  isAddFixtureOpen: boolean;
  setIsAddFixtureOpen: (open: boolean) => void;
  isAddFriendlyOpen: boolean;
  setIsAddFriendlyOpen: (open: boolean) => void;
  isAddFestivalOpen: boolean;
  setIsAddFestivalOpen: (open: boolean) => void;
  isAddTournamentOpen: boolean;
  setIsAddTournamentOpen: (open: boolean) => void;
  isTeamSelectionOpen: boolean;
  setIsTeamSelectionOpen: (open: boolean) => void;
  editingFixture: Fixture | null;
  setEditingFixture: (fixture: Fixture | null) => void;
  editingFestival: any;
  setEditingFestival: (festival: any) => void;
  editingTournament: any;
  setEditingTournament: (tournament: any) => void;
  onRefetchFixtures: () => void;
  onRefetchFestivals: () => void;
  onRefetchTournaments: () => void;
}

export const CalendarDialogs = ({
  date,
  isAddFixtureOpen,
  setIsAddFixtureOpen,
  isAddFriendlyOpen,
  setIsAddFriendlyOpen,
  isAddFestivalOpen,
  setIsAddFestivalOpen,
  isAddTournamentOpen,
  setIsAddTournamentOpen,
  isTeamSelectionOpen,
  setIsTeamSelectionOpen,
  editingFixture,
  setEditingFixture,
  editingFestival,
  setEditingFestival,
  editingTournament,
  setEditingTournament,
  onRefetchFixtures,
  onRefetchFestivals,
  onRefetchTournaments,
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

      <Dialog
        open={isAddTournamentOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddTournamentOpen(false);
            setEditingTournament(null);
          }
        }}
      >
        <AddTournamentDialog
          isOpen={isAddTournamentOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddTournamentOpen(false);
              setEditingTournament(null);
            }
          }}
          selectedDate={date}
          onSuccess={() => {
            onRefetchTournaments();
            setIsAddTournamentOpen(false);
            setEditingTournament(null);
          }}
          editingTournament={editingTournament}
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