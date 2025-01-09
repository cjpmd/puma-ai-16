import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Coach {
  id: string;
  name: string;
  role: string;
  is_admin: boolean;
}

export const Coaches = () => {
  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*");

      if (error) throw error;
      return data as Coach[];
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Coaches</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading coaches data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Admin Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coaches?.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>{coach.name}</TableCell>
                  <TableCell>{coach.role}</TableCell>
                  <TableCell>{coach.is_admin ? "Admin" : "Coach"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};