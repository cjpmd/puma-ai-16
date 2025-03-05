import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { usePeriods } from "../hooks/usePeriods";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PeriodDurationInput } from "./PeriodDurationInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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
    handleFormationChange
  } = useTeamSelection();
  
  const { 
    periodsPerTeam, 
    handleAddPeriod, 
    handleDeletePeriod, 
    handleDurationChange 
  } = usePeriods();
  
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  
  // Get the current team's squad players
  const currentTeam = teams[activeTeamId] || { name: "", squadPlayers: [] };
  const squadPlayerIds = currentTeam.squadPlayers || [];
  
  // Get periods for the active team
  const activePeriods = periodsPerTeam[activeTeamId] || [];

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
                    <Label htmlFor="formation">Formation</Label>
                    <Select
                      value={selectedFormation}
                      onValueChange={setSelectedFormation}
                    >
                      <SelectTrigger id="formation">
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
                  
                  {/* Basic formation display */}
                  <div className="bg-green-900 rounded-md p-4 min-h-[300px] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white text-lg font-semibold">
                        {selectedFormation} Formation
                      </p>
                    </div>
                    <div className="grid grid-rows-4 h-full relative">
                      {/* This is a placeholder for the actual formation slots */}
                      <div className="flex justify-center items-end">
                        <div className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">GK</div>
                      </div>
                      
                      {selectedFormation === "4-4-2" && (
                        <>
                          <div className="flex justify-around items-center">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">D{i}</div>
                            ))}
                          </div>
                          <div className="flex justify-around items-center">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">M{i}</div>
                            ))}
                          </div>
                          <div className="flex justify-around items-start">
                            {[1, 2].map(i => (
                              <div key={i} className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center m-1">F{i}</div>
                            ))}
                          </div>
                        </>
                      )}
                      
                      {/* Other formation layouts would go here */}
                    </div>
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
