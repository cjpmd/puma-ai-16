
interface EmptyEventsMessageProps {
  hasEvents: boolean;
}

export const EmptyEventsMessage = ({ hasEvents }: EmptyEventsMessageProps) => {
  if (hasEvents) return null;
  
  return (
    <div className="text-center py-16 text-muted-foreground min-h-[200px] flex items-center justify-center">
      No events scheduled for this date
    </div>
  );
};
