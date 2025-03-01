
import { useState, useRef, useEffect } from "react";
import { PlayerAvatar } from "./utils/playerDisplayUtils";
import { cn } from "@/lib/utils";

interface DraggablePlayerProps {
  player: { id: string; name: string; squad_number?: number };
  position?: { x: number; y: number };
  onPositionChange: (playerId: string, position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isSubstitution?: boolean;
}

export const DraggablePlayer = ({
  player,
  position,
  onPositionChange,
  containerRef,
  isSubstitution = false
}: DraggablePlayerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const playerPos = useRef(position || { x: 0, y: 0 });

  // Update player position from props
  useEffect(() => {
    if (position) {
      playerPos.current = position;
    }
  }, [position]);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Record initial mouse position
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  // Handle mouse move event while dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      // Calculate container bounds
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate drag distance
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      // Update position (as percentage of container for responsive positioning)
      const newPosX = Math.max(0, Math.min(100, playerPos.current.x + (deltaX / containerRect.width) * 100));
      const newPosY = Math.max(0, Math.min(100, playerPos.current.y + (deltaY / containerRect.height) * 100));
      
      // Update drag start position for next move
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY
      };
      
      // Update player position
      playerPos.current = { x: newPosX, y: newPosY };
      
      // Update position in parent component
      onPositionChange(player.id, { x: newPosX, y: newPosY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, containerRef, player.id, onPositionChange]);

  return (
    <div
      ref={playerRef}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab transition-opacity",
        isDragging && "cursor-grabbing opacity-70 scale-105",
        isSubstitution && "ring-1 ring-orange-500",
        "z-10"  // Add z-index so players are above position slots
      )}
      style={{
        left: `${playerPos.current.x}%`,
        top: `${playerPos.current.y}%`,
        zIndex: isDragging ? 50 : 10
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col items-center">
        <PlayerAvatar 
          name={player.name} 
          squadNumber={player.squad_number}
          size="sm"
        />
        <div className="mt-0.5 text-[6px] font-medium bg-white/80 px-0.5 py-0.5 rounded shadow-sm text-center max-w-6 truncate">
          {player.name.split(' ')[0]}
          {isSubstitution && (
            <span className="ml-0.5 text-orange-500">↑</span>
          )}
        </div>
      </div>
    </div>
  );
};
