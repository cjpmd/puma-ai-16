import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TeamSelectionCard } from "./TeamSelectionCard";
import { usePlayersWithAttendance } from "./hooks/usePlayersWithAttendance";
import { useTeamSelections, PeriodData } from "./hooks/useTeamSelections";
import { Fixture } from "@/types/fixture";
import { FormationFormat } from "@/components/formation/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceCategory } from "@/types/player";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface TeamSelectionManagerProps {
  teams?: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  format?: FormationFormat;
  fixture?: Fixture | null;
  onTeamSelectionsChange?: (selections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>) => void;
  onSuccess?: () => void;
}

export const TeamSelectionManager = ({
  teams: providedTeams,
  format: providedFormat,
  fixture,
  onTeamSelectionsChange,
  onSuccess
}: TeamSelectionManagerProps) => {
  // Use teams from fixture if available, otherwise use provided teams
  const teams = fixture ? [
    {
      id: fixture.id,
      name: fixture.category || "Team",
      category: fixture.category || ""
    }
  ] : providedTeams || [];
  
  // Use format from fixture if available, otherwise use provided format
  const format = fixture?.format as FormationFormat || providedFormat || "7-a-side";
  
  const { 
    teamSelections, 
    selectedPlayers, 
    performanceCategories, 
    teamFormationTemplates,
    periodSelections,
    squadSelections,
    periods,
    dragEnabled,
    handleTeamSelectionChange,
    handlePeriodSelectionChange,
    handlePerformanceCategoryChange,
    handleTemplateChange,
    handleSquadSelectionChange,
    toggleDragEnabled,
    saveSelections,
    addPeriod,
    editPeriod,
    deletePeriod,
    initializeDefaultPeriods
  } = useTeamSelections(onTeamSelectionsChange);
  
  // Force drag and drop to be enabled by default
  const [forceDragEnabled] = useState(true);
  
  const { playersWithStatus, isLoading, error } = usePlayersWithAttendance();
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState("formation"); // "formation" or "periods"
  
  // New period dialog state
  const [isAddPeriodDialogOpen, setIsAddPeriodDialogOpen] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState("");
  const [newPeriodDuration, setNewPeriodDuration] = useState(15);
  const [newPeriodHalf, setNewPeriodHalf] = useState("1");
  const [activePeriodTeamId, setActivePeriodTeamId] = useState<string>("");

  // Ensure format is one of the allowed values
  const validFormat = (format === "5-a-side" || format === "7-a-side" || format === "9-a-side" || format === "11-a-side") 
    ? format 
    : "7-a-side";

  // Initialize default periods for each team
  useEffect(() => {
    teams.forEach(team => {
      initializeDefaultPeriods(team.id);
    });
  }, [teams, initializeDefaultPeriods]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const success = await saveSelections();
      
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving team selections:", error);
      toast("Failed to save team selections", {
        style: { backgroundColor: "red", color: "white" }
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Custom toggle function to ensure our local state is updated
  const handleToggleDragAndDrop = (enabled: boolean) => {
    toggleDragEnabled(enabled);
  };

  // Add a new period
  const handleAddPeriod = () => {
    if (!newPeriodName.trim()) {
      toast("Period name is required", {
        style: { backgroundColor: "orange", color: "white" }
      });
      return;
    }

    addPeriod(
      activePeriodTeamId, 
      parseInt(newPeriodHalf), 
      newPeriodName.trim(), 
      newPeriodDuration
    );
    
    setIsAddPeriodDialogOpen(false);
    setNewPeriodName("");
    setNewPeriodDuration(15);
    
    toast(`Added ${newPeriodName} to ${parseInt(newPeriodHalf) === 1 ? "First Half" : "Second Half"}`, {
      style: { backgroundColor: "green", color: "white" }
    });
  };

  // Prepare to add a period for a specific team
  const openAddPeriodDialog = (teamId: string) => {
    setActivePeriodTeamId(teamId);
    setIsAddPeriodDialogOpen(true);
  };

  // Delete a period
  const handleDeletePeriod = (teamId: string, periodId: number) => {
    deletePeriod(teamId, periodId);
    toast("Period deleted successfully", {
      style: { backgroundColor: "green", color: "white" }
    });
  };

  // Update period duration
  const handlePeriodDurationUpdate = (teamId: string, periodId: number, newDuration: number) => {
    if (newDuration > 0 && newDuration <= 90) {
      editPeriod(teamId, periodId, { duration: newDuration });
    }
  };
  
  // Function to switch to formation view for a specific period
  const navigateToFormationPeriod = (teamId: string, periodId: number) => {
    setActiveView("formation");
    setTimeout(() => {
      const periodElement = document.getElementById(`team-selection-${periodId}`);
      if (periodElement) {
        periodElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (isLoading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error loading players: {error.message}</div>;
  }

  // Helper to get half name from period ID
  const getHalfName = (periodId: number) => {
    return Math.floor(periodId / 100) === 1 ? "First Half" : "Second Half";
  };

  // Group periods by half
  const getPeriodsByHalf = (teamId: string) => {
    const teamPeriods = periods[teamId] || [];
    return {
      firstHalf: teamPeriods.filter(p => Math.floor(p.id / 100) === 1),
      secondHalf: teamPeriods.filter(p => Math.floor(p.id / 100) === 2)
    };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="formation" className="w-full" onValueChange={setActiveView}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="formation">Formation</TabsTrigger>
            <TabsTrigger value="periods">Time Periods</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="formation" className="mt-0">
          {teams.map(team => {
            const teamPeriods = periods[team.id] || [];
            
            // Show default first half if no periods
            if (teamPeriods.length === 0) {
              return (
                <TeamSelectionCard
                  key={`${team.id}-default`}
                  team={team}
                  format={validFormat}
                  players={playersWithStatus}
                  selectedPlayers={selectedPlayers}
                  performanceCategory={performanceCategories[team.id] || "MESSI" as PerformanceCategory}
                  onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
                  onSelectionChange={(selections) => handleTeamSelectionChange(team.id, selections)}
                  formationTemplate={teamFormationTemplates[team.id] || "All"}
                  onTemplateChange={(template) => handleTemplateChange(team.id, template)}
                  viewMode="formation"
                  squadSelection={squadSelections[team.id]}
                  onSquadSelectionChange={(playerIds) => handleSquadSelectionChange(team.id, playerIds)}
                  useDragAndDrop={forceDragEnabled}
                  onToggleDragAndDrop={handleToggleDragAndDrop}
                />
              );
            }
            
            // Otherwise, show a card for each period
            return teamPeriods.map(period => (
              <TeamSelectionCard
                key={`${team.id}-${period.id}`}
                team={team}
                format={validFormat}
                players={playersWithStatus}
                selectedPlayers={selectedPlayers}
                performanceCategory={performanceCategories[team.id] || "MESSI" as PerformanceCategory}
                onPerformanceCategoryChange={(value) => handlePerformanceCategoryChange(team.id, value)}
                onSelectionChange={(selections) => {
                  // Store selections for this specific period
                  handlePeriodSelectionChange(team.id, period.id, selections);
                  // Also update the main team selections
                  handleTeamSelectionChange(team.id, selections);
                }}
                formationTemplate={teamFormationTemplates[team.id] || "All"}
                onTemplateChange={(template) => handleTemplateChange(team.id, template)}
                viewMode="formation"
                periodNumber={Math.floor(period.id / 100)}
                duration={period.duration}
                onDurationChange={(duration) => handlePeriodDurationUpdate(team.id, period.id, duration)}
                squadSelection={squadSelections[team.id]}
                onSquadSelectionChange={(playerIds) => handleSquadSelectionChange(team.id, playerIds)}
                useDragAndDrop={forceDragEnabled}
                onToggleDragAndDrop={handleToggleDragAndDrop}
                periodId={period.id}
              />
            ));
          })}
        </TabsContent>

        <TabsContent value="periods" className="mt-0">
          {teams.map(team => {
            const { firstHalf, secondHalf } = getPeriodsByHalf(team.id);
            
            return (
              <div key={team.id} className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{team.name} - Time Periods</h3>
                  <Button 
                    onClick={() => openAddPeriodDialog(team.id)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Period
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* First Half */}
                  <div>
                    <h4 className="text-md font-medium mb-3">First Half</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {firstHalf.map(period => (
                        <Card key={period.id} className={`${period.id === 100 ? 'border-blue-300' : ''}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">{period.name}</CardTitle>
                              {period.id !== 100 && ( // Don't allow deletion of the default First Half
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeletePeriod(team.id, period.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <Label htmlFor={`duration-${period.id}`} className="w-16">Duration:</Label>
                              <Input
                                id={`duration-${period.id}`}
                                type="number"
                                min="1"
                                max="90" 
                                value={period.duration}
                                onChange={(e) => handlePeriodDurationUpdate(team.id, period.id, parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-500">minutes</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full"
                              variant="outline"
                              onClick={() => navigateToFormationPeriod(team.id, period.id)}
                            >
                              Set Formation
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Second Half */}
                  <div>
                    <h4 className="text-md font-medium mb-3">Second Half</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {secondHalf.map(period => (
                        <Card key={period.id} className={`${period.id === 200 ? 'border-blue-300' : ''}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">{period.name}</CardTitle>
                              {period.id !== 200 && ( // Don't allow deletion of the default Second Half
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeletePeriod(team.id, period.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <Label htmlFor={`duration-${period.id}`} className="w-16">Duration:</Label>
                              <Input
                                id={`duration-${period.id}`}
                                type="number"
                                min="1"
                                max="90" 
                                value={period.duration}
                                onChange={(e) => handlePeriodDurationUpdate(team.id, period.id, parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-500">minutes</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full"
                              variant="outline"
                              onClick={() => navigateToFormationPeriod(team.id, period.id)}
                            >
                              Set Formation
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add Period Dialog */}
          <Dialog open={isAddPeriodDialogOpen} onOpenChange={setIsAddPeriodDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Period</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="period-half">Half</Label>
                  <Select value={newPeriodHalf} onValueChange={setNewPeriodHalf}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select half" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Half</SelectItem>
                      <SelectItem value="2">Second Half</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period-name">Period Name</Label>
                  <Input
                    id="period-name"
                    value={newPeriodName}
                    onChange={(e) => setNewPeriodName(e.target.value)}
                    placeholder="e.g., Opening 15 min"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period-duration">Duration (minutes)</Label>
                  <Input
                    id="period-duration"
                    type="number"
                    min="1"
                    max="90"
                    value={newPeriodDuration}
                    onChange={(e) => setNewPeriodDuration(parseInt(e.target.value) || 15)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPeriodDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPeriod}>
                  Add Period
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Team Selections'}
        </Button>
      </div>
    </div>
  );
};
