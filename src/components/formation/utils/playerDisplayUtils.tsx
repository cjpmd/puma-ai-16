
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

  // Size classes
  const sizeClasses = {
    sm: "h-10 w-10 text-xs",
    md: "h-16 w-16 text-sm",
    lg: "h-20 w-20 text-base",
  };

  return (
    <div className="relative group" onClick={onClick}>
      <Avatar 
        className={`${sizeClasses[size]} ${isSelected ? "ring-2 ring-primary" : ""} cursor-pointer transition-all hover:ring-2 hover:ring-primary/50`}
      >
        <AvatarFallback className="bg-primary/10 font-semibold">
          {squadNumber || initials}
        </AvatarFallback>
      </Avatar>
      
      {/* Team indicators */}
      {teamsPlaying && teamsPlaying.length > 0 && (
        <div className="absolute -top-1 -right-1 flex -space-x-1">
          {teamsPlaying.map((team, index) => (
            <span 
              key={team.id}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white shadow-sm"
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
      <span className="px-1.5 py-0.5 rounded bg-primary/10">Stats coming soon</span>
    </div>
  );
};
