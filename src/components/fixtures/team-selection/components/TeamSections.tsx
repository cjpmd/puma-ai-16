
import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { usePeriods } from "../hooks/usePeriods";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PeriodDurationInput } from "./PeriodDurationInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { FormationView } from "@/components/fixtures/FormationView";

interface TeamSectionsProps {
  availablePlayers: Player[];
}

export const TeamSections = ({ availablePlayers }: TeamSectionsProps) => {
  const { 
    activeTeamId, 
    teams, 
    handleSquadSelection, 
    handleCaptainChange,
    teamCaptains,
    handleFormationChange,
    selections
  } = useTeamSelection();
  
  const { 
    periodsPerTeam, 
    handleAddPeriod, 
    handleDeletePeriod, 
    handleDurationChange 
  } = usePeriods();
  
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  
  // Get the current team's squad players
  const currentTeam = teams[activeTeamId] || { name: "", squadPlayers: [] };
  const squadPlayerIds = currentTeam.squadPlayers || [];
  
  // Get periods for the active team
  const activePeriods = periodsPerTeam[activeTeamId] || [];

  // Set the first period as active if none is selected
  useEffect(() => {
    if (activePeriods.length > 0 && !activePeriodId) {
      setActivePeriodId(activePeriods[0].id);
    }
  }, [activePeriods, activePeriodId]);

  // Handler for squad player selection
  const handlePlayerToggle = (playerId: string) => {
    const newSquad = squadPlayerIds.includes(playerId)
      ? squadPlayerIds.filter(id => id !== playerId)
      : [...squadPlayerIds, playerId];
    
    handleSquadSelection(activeTeamId, newSquad);
  };
  
  // Handler for captain selection
  const onCaptainChange = (playerId: string) => {
    handleCaptainChange(activeTeamId, playerId);
  };

  // Handler for formation selection
  const onFormationChange = (formation: string, periodId: string) => {
    setSelectedFormation(formation);
    
    // Create default formations based on selection
    const formationPlayers = {};
    
    // Add basic positions based on formation
    const formationPositions = {
      "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
      "4-3-3": ["GK", "LB", "CB", "CB", "RB", "DM", "CM", "CM", "LW", "ST", "RW"],
      "3-5-2": ["GK", "CB", "CB", "CB", "LWB", "CM", "CM", "CM", "RWB", "ST", "ST"],
      "5-3-2": ["GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CM", "CM", "ST", "ST"],
      "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "CAM", "LAM", "RAM", "ST"]
    };
    
    // Apply formation
    if (formationPositions[formation]) {
      formationPositions[formation].forEach((pos, index) => {
        formationPlayers[`${pos.toLowerCase()}-${index+1}`] = { 
          playerId: "unassigned", 
          position: pos 
        };
      });
      
      // Add to team selections for this period (first half)
      handleFormationChange(activeTeamId, "1", periodId, formationPlayers);
    }
  };
  
  // Format player name for display
  const getPlayerName = (playerId: string) => {
    const player = availablePlayers.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };
  
  return (
    <div className="space-y-6">
      {/* Squad Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Squad Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-60 pr-4">
            <div className="space-y-2">
              {availablePlayers.map((player) => (
                <div key={player.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-slate-50">
                  <Checkbox 
                    id={`player-${player.id}`}
                    checked={squadPlayerIds.includes(player.id)}
                    onCheckedChange={() => handlePlayerToggle(player.id)}
                  />
                  <Label htmlFor={`player-${player.id}`} className="flex-grow cursor-pointer">
                    {player.name}
                  </Label>
                  {squadPlayerIds.includes(player.id) && (
                    <RadioGroup 
                      value={teamCaptains[activeTeamId] === player.id ? "captain" : ""}
                      onValueChange={(value) => value === "captain" && onCaptainChange(player.id)}
                      className="flex items-center space-x-1"
                    >
                      <RadioGroupItem value="captain" id={`captain-${player.id}`} />
                      <Label htmlFor={`captain-${player.id}`} className="text-xs">Captain</Label>
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Selected players: {squadPlayerIds.length}/{availablePlayers.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Periods Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Periods</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleAddPeriod(activeTeamId)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Period
          </Button>
        </CardHeader>
        <CardContent>
          {activePeriods.length > 0 ? (
            <div className="space-y-4">
              {activePeriods.map((period) => (
                <div key={period.id} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Period {period.id.split('-')[1] || '1'}
                    </h3>
                    <div className="flex space-x-2 items-center">
                      <PeriodDurationInput 
                        teamId={activeTeamId}
                        periodId={period.id}
                        duration={period.duration}
                        onChange={handleDurationChange}
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeletePeriod(activeTeamId, period.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Formation Selection */}
                  <div className="mb-4">
                    <Label htmlFor={`formation-${period.id}`}>Formation</Label>
                    <Select
                      value={selectedFormation}
                      onValueChange={(value) => onFormationChange(value, period.id)}
                    >
                      <SelectTrigger id={`formation-${period.id}`}>
                        <SelectValue placeholder="Select formation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4-4-2">4-4-2</SelectItem>
                        <SelectItem value="4-3-3">4-3-3</SelectItem>
                        <SelectItem value="3-5-2">3-5-2</SelectItem>
                        <SelectItem value="5-3-2">5-3-2</SelectItem>
                        <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Display formation */}
                  <div className="bg-green-900 rounded-md p-4 min-h-[300px] relative">
                    {selections[activeTeamId] && 
                     selections[activeTeamId]["1"] && 
                     selections[activeTeamId]["1"][period.id] ? (
                      <div className="grid grid-rows-4 h-full relative">
                        {/* Show player positions based on formation */}
                        <div className="flex justify-center items-center">
                          {Object.entries(selections[activeTeamId]["1"][period.id])
                            .filter(([key, value]) => value.position === "GK")
                            .map(([key, value], index) => (
                              <div key={key} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">
                                {value.playerId !== "unassigned" 
                                  ? getPlayerName(value.playerId).substring(0, 2) 
                                  : "GK"}
                              </div>
                            ))}
                        </div>
                        
                        {/* Defenders */}
                        <div className="flex justify-around items-center">
                          {Object.entries(selections[activeTeamId]["1"][period.id])
                            .filter(([key, value]) => 
                              value.position === "LB" || 
                              value.position === "CB" || 
                              value.position === "RB" ||
                              value.position === "LWB" ||
                              value.position === "RWB")
                            .map(([key, value], index) => (
                              <div key={key} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">
                                {value.playerId !== "unassigned" 
                                  ? getPlayerName(value.playerId).substring(0, 2) 
                                  : value.position}
                              </div>
                            ))}
                        </div>
                        
                        {/* Midfielders */}
                        <div className="flex justify-around items-center">
                          {Object.entries(selections[activeTeamId]["1"][period.id])
                            .filter(([key, value]) => 
                              value.position === "CM" || 
                              value.position === "CDM" || 
                              value.position === "CAM" ||
                              value.position === "LM" ||
                              value.position === "RM" ||
                              value.position === "DM")
                            .map(([key, value], index) => (
                              <div key={key} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">
                                {value.playerId !== "unassigned" 
                                  ? getPlayerName(value.playerId).substring(0, 2) 
                                  : value.position}
                              </div>
                            ))}
                        </div>
                        
                        {/* Forwards */}
                        <div className="flex justify-around items-start">
                          {Object.entries(selections[activeTeamId]["1"][period.id])
                            .filter(([key, value]) => 
                              value.position === "ST" || 
                              value.position === "LW" || 
                              value.position === "RW" ||
                              value.position === "CF" ||
                              value.position === "LAM" ||
                              value.position === "RAM")
                            .map(([key, value], index) => (
                              <div key={key} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">
                                {value.playerId !== "unassigned" 
                                  ? getPlayerName(value.playerId).substring(0, 2) 
                                  : value.position}
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white text-lg font-semibold">
                          {selectedFormation} Formation
                        </p>
                        <p className="text-white text-sm mt-2">
                          Select a formation to start team setup
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <p>No periods configured for this team. Add a period to start team selection.</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
