
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PeriodCard } from "./PeriodCard";

interface PeriodsViewProps {
  teams: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  periods: Record<string, any[]>;
  openAddPeriodDialog: (teamId: string) => void;
  handleDeletePeriod: (teamId: string, periodId: number) => void;
  handlePeriodDurationUpdate: (teamId: string, periodId: number, newDuration: number) => void;
  navigateToFormationPeriod: (teamId: string, periodId: number) => void;
}

export const PeriodsView = ({
  teams,
  periods,
  openAddPeriodDialog,
  handleDeletePeriod,
  handlePeriodDurationUpdate,
  navigateToFormationPeriod,
}: PeriodsViewProps) => {
  // Helper to get periods grouped by half
  const getPeriodsByHalf = (teamId: string) => {
    const teamPeriods = periods[teamId] || [];
    return {
      firstHalf: teamPeriods.filter(p => Math.floor(p.id / 100) === 1),
      secondHalf: teamPeriods.filter(p => Math.floor(p.id / 100) === 2)
    };
  };

  return (
    <>
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
                    <PeriodCard
                      key={period.id}
                      periodId={period.id}
                      periodName={period.name}
                      duration={period.duration}
                      teamId={team.id}
                      isDefault={period.id === 100}
                      onDurationChange={(duration) => handlePeriodDurationUpdate(team.id, period.id, duration)}
                      onDeletePeriod={() => handleDeletePeriod(team.id, period.id)}
                      onNavigate={() => navigateToFormationPeriod(team.id, period.id)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Second Half */}
              <div>
                <h4 className="text-md font-medium mb-3">Second Half</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {secondHalf.map(period => (
                    <PeriodCard
                      key={period.id}
                      periodId={period.id}
                      periodName={period.name}
                      duration={period.duration}
                      teamId={team.id}
                      isDefault={period.id === 200}
                      onDurationChange={(duration) => handlePeriodDurationUpdate(team.id, period.id, duration)}
                      onDeletePeriod={() => handleDeletePeriod(team.id, period.id)}
                      onNavigate={() => navigateToFormationPeriod(team.id, period.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};
