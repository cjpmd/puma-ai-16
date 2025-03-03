
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PeriodCard } from "./PeriodCard";
import { getFormationFormat } from "../utils/formationUtils";

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
  if (periods.length === 0) {
    return <EmptyPeriodsView title={title} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} - All Periods</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {periods.map((period) => (
            <PeriodCard
              key={period.id}
              period={period}
              availablePlayers={availablePlayers}
              squadPlayers={squadPlayers}
              performanceCategory={performanceCategory}
              selections={getSelections(period.id)}
              onFormationChange={(selections) => onFormationChange(period.id, selections)}
              format={getFormationFormat(fixture)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// When no periods are defined
const EmptyPeriodsView = ({ title }: { title: string }) => {
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
};
