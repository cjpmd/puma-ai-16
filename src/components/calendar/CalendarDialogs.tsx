
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { AddFestivalDialog } from "@/components/calendar/AddFestivalDialog";
import { AddTournamentDialog } from "@/components/calendar/AddTournamentDialog";
import { FestivalTeamSelection } from "@/components/calendar/festival/FestivalTeamSelection";
import { TournamentTeamSelection } from "@/components/calendar/tournament/TournamentTeamSelection";
import { Fixture } from "@/types/fixture";

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
  editingFestival: any | null;
  setEditingFestival: (festival: any | null) => void;
  editingTournament: any | null;
  setEditingTournament: (tournament: any | null) => void;
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
  console.log("CalendarDialogs - editingFixture:", editingFixture);

  return (
    <>
      {/* Fixture Dialog */}
      <AddFixtureDialog
        isOpen={isAddFixtureOpen}
        onOpenChange={(open) => {
          setIsAddFixtureOpen(open);
          if (!open) {
            // Reset editing fixture when dialog closes
            setEditingFixture(null);
          }
        }}
        selectedDate={date}
        onSuccess={() => {
          onRefetchFixtures();
        }}
        editingFixture={editingFixture}
        showDateSelector={!editingFixture}
      />

      {/* Festival Dialog */}
      <AddFestivalDialog
        isOpen={isAddFestivalOpen}
        onOpenChange={(open) => {
          setIsAddFestivalOpen(open);
          if (!open) {
            setEditingFestival(null);
          }
        }}
        selectedDate={date}
        onSuccess={() => {
          onRefetchFestivals();
        }}
        editingFestival={editingFestival}
      />

      {/* Tournament Dialog */}
      <AddTournamentDialog
        isOpen={isAddTournamentOpen}
        onOpenChange={(open) => {
          setIsAddTournamentOpen(open);
          if (!open) {
            setEditingTournament(null);
          }
        }}
        selectedDate={date}
        onSuccess={() => {
          onRefetchTournaments();
        }}
        editingTournament={editingTournament}
      />

      {/* Team Selection for Festivals */}
      {editingFestival && (
        <FestivalTeamSelection
          isOpen={isTeamSelectionOpen}
          onOpenChange={setIsTeamSelectionOpen}
          festival={editingFestival}
          onSuccess={() => {
            setIsTeamSelectionOpen(false);
            setEditingFestival(null);
          }}
        />
      )}

      {/* Team Selection for Tournaments */}
      {editingTournament && (
        <TournamentTeamSelection
          isOpen={isTeamSelectionOpen}
          onOpenChange={setIsTeamSelectionOpen}
          tournament={editingTournament}
          onSuccess={() => {
            setIsTeamSelectionOpen(false);
            setEditingTournament(null);
          }}
        />
      )}
    </>
  );
};
