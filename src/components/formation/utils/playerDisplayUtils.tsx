
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Creates a player avatar with squad number or initials
 */
export const PlayerAvatar = ({
  name,
  squadNumber,
  size = "md",
  isSelected = false,
  teamsPlaying = [],
  onClick,
}: {
  name: string;
  squadNumber?: number;
  size?: "sm" | "md" | "lg";
  isSelected?: boolean;
  teamsPlaying?: Array<{ id: string; name: string }>;
  onClick?: () => void;
}) => {
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Size classes - making all sizes smaller
  const sizeClasses = {
    sm: "h-4 w-4 text-[6px]",
    md: "h-5 w-5 text-[8px]",
    lg: "h-6 w-6 text-[10px]",
  };

  return (
    <div className="relative group" onClick={onClick}>
      <Avatar 
        className={`${sizeClasses[size]} ${isSelected ? "ring-1 ring-primary" : ""} cursor-pointer transition-all hover:ring-1 hover:ring-primary/50`}
      >
        <AvatarFallback className="bg-primary/10 font-semibold">
          {squadNumber || initials}
        </AvatarFallback>
      </Avatar>
      
      {/* Team indicators - made smaller */}
      {teamsPlaying && teamsPlaying.length > 0 && (
        <div className="absolute -top-0.5 -right-0.5 flex -space-x-0.5">
          {teamsPlaying.map((team, index) => (
            <span 
              key={team.id}
              className="flex h-1.5 w-1.5 items-center justify-center rounded-full bg-primary text-[4px] text-white shadow-sm"
              style={{ zIndex: 10 - index }}
              title={`Playing in ${team.name}`}
            >
              {team.name.charAt(0)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Player stat summary component
 */
export const PlayerStatSummary = ({
  player,
}: {
  player: { id: string; name: string; squad_number?: number };
}) => {
  // This is a placeholder component - to be enhanced later as requested
  return (
    <div className="mt-1 text-xs text-muted-foreground">
      <span className="px-1 py-0.5 rounded bg-primary/10">Stats coming soon</span>
    </div>
  );
};
