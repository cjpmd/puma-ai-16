
import React from "react";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { FormationFormat } from "@/components/formation/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Period {
  id: string;
  duration: number;
}

interface AllPeriodsViewProps {
  title: string;
  teamId: string;
  fixture: any;
  periods: Period[];
  availablePlayers: any[];
  squadPlayers: string[];
  performanceCategory: string;
  getSelections: (periodId: string) => Record<string, { playerId: string; position: string; isSubstitution?: boolean }>;
  onFormationChange: (periodId: string, selections: Record<string, { playerId: string; position: string; isSubstitution?: boolean }>) => void;
}

export const AllPeriodsView = ({
  title,
  teamId,
  fixture,
  periods,
  availablePlayers,
  squadPlayers,
  performanceCategory,
  getSelections,
  onFormationChange
}: AllPeriodsViewProps) => {
  const getFormat = (): FormationFormat => {
    switch (fixture?.format) {
      case "5-a-side": return "5-a-side";
      case "7-a-side": return "7-a-side";
      case "9-a-side": return "9-a-side";
      case "11-a-side": return "11-a-side";
      default: return "7-a-side";
    }
  };

  if (periods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title} - No periods defined</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Add periods to see formations here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} - All Periods</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {periods.map((period) => (
            <div key={period.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">
                  {period.id.replace('period-', 'Period ')}
                </h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{period.duration} min</Badge>
                  <Badge>{performanceCategory}</Badge>
                </div>
              </div>
              <div className="aspect-[2/3] relative">
                <DraggableFormation
                  format={getFormat()}
                  availablePlayers={availablePlayers}
                  squadPlayers={squadPlayers}
                  initialSelections={getSelections(period.id)}
                  onSelectionChange={(selections) => onFormationChange(period.id, selections)}
                  renderSubstitutionIndicator={(position) => (
                    position.includes('SUB') ? (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-white text-[8px] flex items-center justify-center">
                        S
                      </span>
                    ) : null
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
