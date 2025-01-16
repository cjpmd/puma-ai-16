import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TeamSelectionManager } from "@/components/fixtures/TeamSelectionManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Fixtures = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const { toast } = useToast();

  const { data: fixtures, isLoading, refetch } = useQuery({
    queryKey: ["fixtures"],
    queryFn: async () => {
      console.log("Fetching fixtures...");
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching fixtures:", error);
        throw error;
      }
      
      console.log("Fixtures data:", data);

      // Group fixtures by date
      const groupedFixtures = data.reduce((acc: any, fixture: any) => {
        const date = fixture.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(fixture);
        return acc;
      }, {});

      return groupedFixtures;
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

  const getScoreDisplay = (homeScore: number | null, awayScore: number | null) => {
    if (homeScore === null || awayScore === null) return "Not played";
    return `${homeScore} - ${awayScore}`;
  };

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

      <AddFixtureDialog 
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedFixture(null);
        }}
        onSuccess={() => {
          refetch();
          setSelectedFixture(null);
        }}
        editingFixture={selectedFixture}
        selectedDate={selectedFixture ? parseISO(selectedFixture.date) : undefined}
      />

      {!fixtures || Object.keys(fixtures).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No fixtures found. Add your first fixture to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(fixtures).map(([date, dateFixtures]: [string, any[]]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-xl font-semibold">
                {format(parseISO(date), "EEEE, MMMM do, yyyy")}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Opponent</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateFixtures.map((fixture) => (
                    <TableRow 
                      key={fixture.id} 
                      className="cursor-pointer hover:bg-accent/50" 
                      onClick={() => handleEdit(fixture)}
                    >
                      <TableCell>
                        <Badge variant="outline">{fixture.category}</Badge>
                      </TableCell>
                      <TableCell>{fixture.location || "TBD"}</TableCell>
                      <TableCell>{fixture.time || "TBD"}</TableCell>
                      <TableCell>{fixture.opponent}</TableCell>
                      <TableCell>
                        {getScoreDisplay(fixture.home_score, fixture.away_score)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamSelection(fixture);
                          }}
                        >
                          Team Selection
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(fixture.id);
                          }}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

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