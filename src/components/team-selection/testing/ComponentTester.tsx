import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DefaultFormationCard } from "../components/DefaultFormationCard";
import { PeriodFormationCard } from "../components/PeriodFormationCard";
import { TeamSelectionCardHeader } from "../components/TeamSelectionCardHeader";
import { PerformanceCategorySelector } from "../components/PerformanceCategorySelector";
import { PerformanceCategory } from "@/types/player";

/**
 * ComponentTester
 * 
 * A simple component for visually testing team selection components
 * This is not meant for production use, but for development testing
 */
export const ComponentTester = () => {
  // State for testing various components
  const [performanceCategory, setPerformanceCategory] = useState<PerformanceCategory>("MESSI");
  const [formationTemplate, setFormationTemplate] = useState("4-3-3");
  const [useDragAndDrop, setUseDragAndDrop] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set(["player1", "player2"]));
  const [squadSelection, setSquadSelection] = useState<string[]>(["player1", "player2"]);
  
  // Mock data for testing
  const mockTeam = {
    id: "team1",
    name: "Test Team",
    category: "U10"
  };
  
  const mockPeriod = {
    id: 101,
    name: "First Half",
    duration: 45
  };
  
  const mockPlayers = [
    { id: "player1", name: "John Doe", squad_number: 1 },
    { id: "player2", name: "Jane Smith", squad_number: 2 },
    { id: "player3", name: "Bob Johnson", squad_number: 3 },
  ];

  // Dummy handlers
  const handleSelectionChange = (selections: any) => {
    console.log("Selection changed:", selections);
  };
  
  const handleSquadSelectionChange = (playerIds: string[]) => {
    console.log("Squad selection changed:", playerIds);
    setSquadSelection(playerIds);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Component Tester</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="header">
          <TabsList className="mb-4">
            <TabsTrigger value="header">Card Header</TabsTrigger>
            <TabsTrigger value="performance">Performance Selector</TabsTrigger>
            <TabsTrigger value="default">Default Card</TabsTrigger>
            <TabsTrigger value="period">Period Card</TabsTrigger>
          </TabsList>
          
          <TabsContent value="header" className="p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-4">TeamSelectionCardHeader</h3>
            <TeamSelectionCardHeader
              team={mockTeam}
              performanceCategory={performanceCategory}
              onPerformanceCategoryChange={setPerformanceCategory}
              useDragAndDrop={useDragAndDrop}
              onToggleDragAndDrop={setUseDragAndDrop}
            />
          </TabsContent>
          
          <TabsContent value="performance" className="p-4 border rounded-md">
            <h3 className="text-sm font-medium mb-4">PerformanceCategorySelector</h3>
            <PerformanceCategorySelector
              value={performanceCategory}
              onChange={setPerformanceCategory}
            />
            <div className="mt-4">
              <p>Selected value: {performanceCategory}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="default">
            <h3 className="text-sm font-medium mb-4">DefaultFormationCard</h3>
            <DefaultFormationCard
              team={mockTeam}
              format="7-a-side"
              players={mockPlayers}
              selectedPlayers={selectedPlayers}
              performanceCategory={performanceCategory}
              onPerformanceCategoryChange={setPerformanceCategory}
              onSelectionChange={handleSelectionChange}
              formationTemplate={formationTemplate}
              onTemplateChange={setFormationTemplate}
              squadSelection={squadSelection}
              onSquadSelectionChange={handleSquadSelectionChange}
              useDragAndDrop={useDragAndDrop}
              onToggleDragAndDrop={setUseDragAndDrop}
            />
          </TabsContent>
          
          <TabsContent value="period">
            <h3 className="text-sm font-medium mb-4">PeriodFormationCard</h3>
            <PeriodFormationCard
              team={mockTeam}
              period={mockPeriod}
              format="7-a-side"
              players={mockPlayers}
              selectedPlayers={selectedPlayers}
              performanceCategory={performanceCategory}
              onPerformanceCategoryChange={setPerformanceCategory}
              onSelectionChange={handleSelectionChange}
              onPeriodSelectionChange={handleSelectionChange}
              formationTemplate={formationTemplate}
              onTemplateChange={setFormationTemplate}
              squadSelection={squadSelection}
              onSquadSelectionChange={handleSquadSelectionChange}
              useDragAndDrop={useDragAndDrop}
              onToggleDragAndDrop={setUseDragAndDrop}
              onDurationChange={(duration) => console.log("Duration changed:", duration)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
