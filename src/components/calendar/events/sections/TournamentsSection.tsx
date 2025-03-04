
import { TournamentEvent } from "../TournamentEvent";

interface TournamentsSectionProps {
  tournaments: any[];
  onEditTournament?: (tournament: any) => void;
  onDeleteTournament?: (tournamentId: string) => void;
  onTeamSelectionTournament?: (tournament: any) => void;
  onDateChange?: (tournamentId: string, newDate: Date) => void;
}

export const TournamentsSection = ({
  tournaments,
  onEditTournament,
  onDeleteTournament,
  onTeamSelectionTournament,
  onDateChange,
}: TournamentsSectionProps) => {
  if (!tournaments.length) return null;

  return (
    <>
      {tournaments.map((tournament) => (
        <TournamentEvent
          key={tournament.id}
          tournament={tournament}
          onEdit={onEditTournament}
          onTeamSelection={onTeamSelectionTournament}
          onDelete={onDeleteTournament}
          onDateChange={onDateChange}
        />
      ))}
    </>
  );
};
