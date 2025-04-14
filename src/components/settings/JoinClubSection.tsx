
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JoinClubSectionProps {
  teamId: string;
  currentClub: any | null;
  onClubJoined: () => void;
}

export function JoinClubSection({ teamId, currentClub, onClubJoined }: JoinClubSectionProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleJoinClub = async () => {
    if (!serialNumber.trim()) {
      setError("Please enter a club serial number");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Find the club with this serial number
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('serial_number', serialNumber.trim())
        .maybeSingle();
        
      if (clubError) throw clubError;
      
      if (!clubData) {
        setError("No club found with this serial number. Please check and try again.");
        return;
      }
      
      // Update the team's club_id
      const { error: updateError } = await supabase
        .from('teams')
        .update({ 
          club_id: clubData.id,
          joined_club_at: new Date().toISOString()
        })
        .eq('id', teamId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `Your team has joined ${clubData.name}`,
      });
      
      onClubJoined();
    } catch (err) {
      console.error("Error joining club:", err);
      setError("Failed to join club. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLeaveClub = async () => {
    if (!currentClub) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({ 
          club_id: null,
          joined_club_at: null
        })
        .eq('id', teamId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Your team has left ${currentClub.name}`,
      });
      
      onClubJoined();
    } catch (err) {
      console.error("Error leaving club:", err);
      toast({
        title: "Error",
        description: "Failed to leave club. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Club Membership</CardTitle>
        <CardDescription>
          {currentClub 
            ? `Your team is currently a member of ${currentClub.name}`
            : "Join a club by entering the club's serial number"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentClub ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-green-50">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Connected to {currentClub.name}</h3>
                  <p className="text-sm text-muted-foreground">Your team is part of this club</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleLeaveClub} 
              disabled={loading}
            >
              {loading ? "Processing..." : "Leave Club"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter club serial number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
              <Button onClick={handleJoinClub} disabled={loading}>
                {loading ? "Processing..." : "Join Club"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the serial number provided by the club administrator to join their club
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
