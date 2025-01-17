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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
      console.log("Fetching fixtures with filters:", {
        filterYear,
        filterMonth,
        filterDate,
        filterOpponent,
        filterCategory
      });

      let query = supabase
        .from("fixtures")
        .select("*")
        .order("date", { ascending: true });

      try {
        // Handle date filtering
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

        console.log("Executing Supabase query...");
        const { data, error } = await query;

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }
        
        console.log("Fixtures data received:", data);

        // Group fixtures by date
        const groupedFixtures = (data || []).reduce((acc: any, fixture: any) => {
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
    console.error("Fixtures error:", error);
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading fixtures: {error.message}
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: format(new Date(2024, i, 1), 'MMMM') };
  });

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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="h-10"
        />

        <Input
          placeholder="Search opponent..."
          value={filterOpponent}
          onChange={(e) => setFilterOpponent(e.target.value)}
          className="h-10"
        />

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Ronaldo">Ronaldo</SelectItem>
            <SelectItem value="Messi">Messi</SelectItem>
            <SelectItem value="Jags">Jags</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
        {Object.entries(fixtures || {}).map(([date, dateFixtures]: [string, any[]]) => (
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
                      {fixture.home_score !== null && fixture.away_score !== null
                        ? `${fixture.home_score} - ${fixture.away_score}`
                        : "Not played"}
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

      <AddFixtureDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingFixture={selectedFixture}
        onSuccess={() => {
          refetch();
          setIsDialogOpen(false);
        }}
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