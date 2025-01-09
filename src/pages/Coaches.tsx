import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Coach {
  id: string;
  name: string;
  role: string;
  is_admin: boolean;
}

export const Coaches = () => {
  const [isAddingCoach, setIsAddingCoach] = useState(false);
  const [newCoachName, setNewCoachName] = useState("");
  const [newCoachEmail, setNewCoachEmail] = useState("");
  const { toast } = useToast();

  const { data: coaches, isLoading, refetch } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*");

      if (error) throw error;
      return data as Coach[];
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUserRole"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: coach } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return coach;
    },
  });

  const handleAddCoach = async () => {
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: newCoachEmail,
        password: Math.random().toString(36).slice(-8), // Generate random password
      });

      if (signUpError) throw signUpError;

      const { error: coachError } = await supabase
        .from("coaches")
        .insert([
          {
            name: newCoachName,
            user_id: user?.id,
            role: "coach",
            is_admin: false,
          },
        ]);

      if (coachError) throw coachError;

      toast({
        title: "Coach added successfully",
        description: "An email will be sent to the coach with login instructions.",
      });

      setIsAddingCoach(false);
      setNewCoachName("");
      setNewCoachEmail("");
      refetch();
    } catch (error) {
      toast({
        title: "Error adding coach",
        description: "There was an error adding the coach. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">Coaches</h1>
          </div>
          {currentUser?.is_admin && (
            <Dialog open={isAddingCoach} onOpenChange={setIsAddingCoach}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coach
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Coach</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCoachName}
                      onChange={(e) => setNewCoachName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCoachEmail}
                      onChange={(e) => setNewCoachEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddCoach} className="w-full">
                    Add Coach
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
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