
import { SessionCard } from "@/components/training/SessionCard";

interface SessionsSectionProps {
  sessions: any[];
  fileUrls: Record<string, string>;
  onAddDrill: (sessionId: string) => void;
  onEditDrill: (sessionId: string, drill: any) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionsSection = ({
  sessions,
  fileUrls,
  onAddDrill,
  onEditDrill,
  onDeleteSession,
}: SessionsSectionProps) => {
  if (!sessions.length) return null;

  return (
    <>
      {sessions.map((session) => (
        <SessionCard 
          key={session.id}
          session={{
            id: session.id,
            title: session.title,
            drills: session.training_drills.map((drill: any) => ({
              id: drill.id,
              title: drill.title,
              instructions: drill.instructions,
              training_files: drill.training_files
            }))
          }}
          fileUrls={fileUrls}
          onAddDrillClick={onAddDrill}
          onEditDrillClick={onEditDrill}
          onDeleteSession={onDeleteSession}
        />
      ))}
    </>
  );
};
