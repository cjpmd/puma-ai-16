
import React from "react";
import { FormationFormat } from "../../types";
import { FormationGrid } from "./FormationGrid";
import { SquadPlayersSection } from "./SquadPlayersSection";
import { SubstitutesSection } from "./SubstitutesSection";

interface FormationModeViewProps {
  format: FormationFormat;
  template: string;
  selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  selectedPlayerId: string | null;
  onDrop: (slotId: string, position: string, fromSlotId?: string) => void;
  onRemovePlayer: (slotId: string) => void;
  getPlayerById: (playerId: string) => any;
  handleDragStart: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd: () => void;
  renderSubstitutionIndicator?: (position: string) => React.ReactNode;
  availablePlayers: any[];
  squadPlayers: string[];
  onRemoveFromSquad: (playerId: string) => void;
  onPlayerClick: (playerId: string) => void;
  addSubstitute: (playerId: string) => void;
  removeSubstitute: (slotId: string) => void;
}

export const FormationModeView: React.FC<FormationModeViewProps> = ({
  format,
  template,
  selections,
  selectedPlayerId,
  onDrop,
  onRemovePlayer,
  getPlayerById,
  handleDragStart,
  handleDragEnd,
  renderSubstitutionIndicator,
  availablePlayers,
  squadPlayers,
  onRemoveFromSquad,
  onPlayerClick,
  addSubstitute,
  removeSubstitute
}) => {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="lg:w-3/4 h-[500px]">
          <FormationGrid
            format={format}
            template={template}
            selections={selections}
            selectedPlayerId={selectedPlayerId}
            onDrop={onDrop}
            onRemovePlayer={onRemovePlayer}
            getPlayerById={getPlayerById}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            renderSubstitutionIndicator={renderSubstitutionIndicator}
          />
        </div>
        
        <div className="lg:w-1/4 space-y-4">
          <SquadPlayersSection
            players={availablePlayers}
            squadPlayers={squadPlayers}
            onRemoveFromSquad={onRemoveFromSquad}
            selectedPlayerId={selectedPlayerId}
            onPlayerClick={onPlayerClick}
            squadMode={false}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
          />
        </div>
      </div>
      
      <SubstitutesSection
        selections={selections}
        availablePlayers={availablePlayers}
        getPlayerById={getPlayerById}
        addSubstitute={addSubstitute}
        removeSubstitute={removeSubstitute}
        selectedPlayerId={selectedPlayerId}
        onPlayerClick={onPlayerClick}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
        renderSubstitutionIndicator={renderSubstitutionIndicator}
        format={format}
      />
    </>
  );
};
