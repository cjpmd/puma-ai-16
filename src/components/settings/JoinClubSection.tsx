
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Check, InfoIcon, SearchIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JoinClubSectionProps {
  teamId: string;
  currentClub: any | null;
  onClubJoined: () => void;
}

export function JoinClubSection({ teamId, currentClub, onClubJoined }: JoinClubSectionProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundClub, setFoundClub] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentClub) {
      setFoundClub(null);
    }
  }, [currentClub]);

  const handleSearchClub = async () => {
    if (!serialNumber.trim()) {
      setError("Please enter a club serial number");
      return;
    }
    
    setSearching(true);
    setError(null);
    setFoundClub(null);
    
    try {
      // Find the club with this serial number
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id, name, location, contact_email')
        .eq('serial_number', serialNumber.trim())
        .maybeSingle();
        
      if (clubError) throw clubError;
      
      if (!clubData) {
        setError("No club found with this serial number. Please check and try again.");
        return;
      }
      
      setFoundClub(clubData);
      toast({
        title: "Club Found",
        description: `Found ${clubData.name}`,
      });
    } catch (err) {
      console.error("Error searching club:", err);
      setError("Failed to search for club. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleJoinClub = async () => {
    if (!foundClub) {
      setError("Please search for a club first");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Update the team's club_id
      const { error: updateError } = await supabase
        .from('teams')
        .update({ 
          club_id: foundClub.id,
          joined_club_at: new Date().toISOString()
        })
        .eq('id', teamId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: `Your team has joined ${foundClub.name}`,
      });
      
      onClubJoined();
      setFoundClub(null);
      setSerialNumber("");
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
                  
                  <div className="mt-4 space-y-1 text-sm">
                    <p><strong>Location:</strong> {currentClub.location || 'Not specified'}</p>
                    <p><strong>Contact:</strong> {currentClub.contact_email || 'Not specified'}</p>
                    <p><strong>Club ID:</strong> {currentClub.id}</p>
                    <p><strong>Joined:</strong> {currentClub.joined_club_at 
                      ? new Date(currentClub.joined_club_at).toLocaleDateString() 
                      : 'Unknown'}</p>
                  </div>
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
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter club serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
                <Button 
                  onClick={handleSearchClub} 
                  disabled={searching || !serialNumber.trim()}
                  variant="secondary"
                >
                  <SearchIcon className="h-4 w-4 mr-1" />
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Enter the serial number provided by the club administrator to find and join their club
              </p>
              
              {foundClub && (
                <div className="mt-4 p-4 border rounded-md bg-blue-50">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">Club Found: {foundClub.name}</h3>
                      
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Location:</strong> {foundClub.location || 'Not specified'}</p>
                        <p><strong>Contact:</strong> {foundClub.contact_email || 'Not specified'}</p>
                      </div>
                      
                      <Button 
                        className="mt-4" 
                        onClick={handleJoinClub} 
                        disabled={loading}
                      >
                        {loading ? "Joining..." : "Join This Club"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
