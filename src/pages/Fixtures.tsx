import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FixturesFilter } from "@/components/fixtures/FixturesFilter";
import { FixturesList } from "@/components/fixtures/FixturesList";

const Fixtures = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterOpponent, setFilterOpponent] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const { data: fixtures, isLoading, error, refetch } = useQuery({
    queryKey: ["fixtures", filterYear, filterMonth, filterDate, filterOpponent, filterCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from("combined_game_metrics")
          .select("*")
          .order("date", { ascending: true });

        if (filterDate) {
          query = query.eq("date", filterDate);
        } else if (filterYear !== "all") {
          const yearStart = `${filterYear}-01-01`;
          const yearEnd = `${filterYear}-12-31`;
          query = query.gte("date", yearStart).lte("date", yearEnd);
          
          if (filterMonth !== "all") {
            const monthStart = `${filterYear}-${filterMonth}-01`;
            const nextMonth = parseInt(filterMonth) + 1;
            const monthEnd = nextMonth > 12 
              ? `${parseInt(filterYear) + 1}-01-01`
              : `${filterYear}-${String(nextMonth).padStart(2, '0')}-01`;
            
            query = query.gte("date", monthStart).lt("date", monthEnd);
          }
        }

        if (filterOpponent) {
          query = query.ilike("opponent", `%${filterOpponent}%`);
        }
        
        if (filterCategory !== "all") {
          query = query.eq("category", filterCategory);
        }

        const { data: fixturesData, error: fixturesError } = await query;

        if (fixturesError) throw fixturesError;

        // Group fixtures by date
        const groupedFixtures = (fixturesData || []).reduce((acc: any, fixture: any) => {
          const date = fixture.date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(fixture);
          return acc;
        }, {});

        return groupedFixtures;
      } catch (error) {
        console.error("Error in fixtures query:", error);
        throw error;
      }
    },
  });

  const handleDelete = async (fixtureId: string) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", fixtureId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fixture deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete fixture",
      });
    }
  };

  const handleEdit = (fixture: any) => {
    setSelectedFixture(fixture);
    setIsDialogOpen(true);
  };

  const handleTeamSelection = (fixture: any) => {
    setSelectedFixture(fixture);
    setShowTeamSelection(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading fixtures: {error instanceof Error ? error.message : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fixtures</h1>
        <Button 
          onClick={() => {
            setSelectedFixture(null);
            setIsDialogOpen(true);
          }}
        >
          Add Fixture
        </Button>
      </div>

      <FixturesFilter
        filterYear={filterYear}
        filterMonth={filterMonth}
        filterDate={filterDate}
        filterOpponent={filterOpponent}
        filterCategory={filterCategory}
        onYearChange={setFilterYear}
        onMonthChange={setFilterMonth}
        onDateChange={setFilterDate}
        onOpponentChange={setFilterOpponent}
        onCategoryChange={setFilterCategory}
      />

      <FixturesList
        fixtures={fixtures}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTeamSelection={handleTeamSelection}
      />

      <AddFixtureDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingFixture={selectedFixture}
        onSuccess={() => {
          refetch();
          setIsDialogOpen(false);
        }}
        showDateSelector={!selectedFixture}
      />

      <Dialog open={showTeamSelection} onOpenChange={setShowTeamSelection}>
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Team Selection - {selectedFixture?.opponent}</DialogTitle>
          </DialogHeader>
          {selectedFixture && (
            <TeamSelectionManager 
              fixtureId={selectedFixture.id} 
              category={selectedFixture.category}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fixtures;