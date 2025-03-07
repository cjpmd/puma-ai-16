
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePlayersWithAttendance } from "./hooks/usePlayersWithAttendance";
import { useTeamSelections } from "./hooks/useTeamSelections";
import { Fixture } from "@/types/fixture";
import { FormationFormat } from "@/components/formation/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceCategory } from "@/types/player";
import { toast } from "sonner";
import { FormationView } from "./components/FormationView";
import { PeriodsView } from "./components/PeriodsView";
import { PeriodDialog } from "./components/PeriodDialog";

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
          <FormationView
            teams={teams}
            format={validFormat}
            playersWithStatus={playersWithStatus}
            selectedPlayers={selectedPlayers}
            performanceCategories={performanceCategories}
            teamFormationTemplates={teamFormationTemplates}
            squadSelections={squadSelections}
            periods={periods}
            handlePerformanceCategoryChange={handlePerformanceCategoryChange}
            handleTeamSelectionChange={handleTeamSelectionChange}
            handlePeriodSelectionChange={handlePeriodSelectionChange}
            handleTemplateChange={handleTemplateChange}
            handleSquadSelectionChange={handleSquadSelectionChange}
            toggleDragEnabled={toggleDragEnabled}
            handlePeriodDurationUpdate={handlePeriodDurationUpdate}
            forceDragEnabled={forceDragEnabled}
          />
        </TabsContent>

        <TabsContent value="periods" className="mt-0">
          <PeriodsView
            teams={teams}
            periods={periods}
            openAddPeriodDialog={openAddPeriodDialog}
            handleDeletePeriod={handleDeletePeriod}
            handlePeriodDurationUpdate={handlePeriodDurationUpdate}
            navigateToFormationPeriod={navigateToFormationPeriod}
          />
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

      {/* Add Period Dialog */}
      <PeriodDialog
        isOpen={isAddPeriodDialogOpen}
        onOpenChange={setIsAddPeriodDialogOpen}
        onAddPeriod={handleAddPeriod}
        newPeriodName={newPeriodName}
        setNewPeriodName={setNewPeriodName}
        newPeriodDuration={newPeriodDuration}
        setNewPeriodDuration={setNewPeriodDuration}
        newPeriodHalf={newPeriodHalf}
        setNewPeriodHalf={setNewPeriodHalf}
      />
    </div>
  );
};
