
interface EmptyEventsMessageProps {
  hasEvents: boolean | number;
}

export const EmptyEventsMessage = ({ hasEvents }: EmptyEventsMessageProps) => {
  // Convert to boolean - empty arrays, 0, null, undefined will all be treated as false
  const hasEventsBoolean = Boolean(hasEvents);
  
  if (hasEventsBoolean) return null;
  
  return (
    <div className="text-center py-16 text-muted-foreground min-h-[200px] flex items-center justify-center">
      No events scheduled for this date
    </div>
  );
};
