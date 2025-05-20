
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, ChartLine, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PlayerProfile {
  id: string;
  name: string;
  squad_number: number;
  date_of_birth: string;
  profile_image?: string | null;
  player_type: string;
  age?: number;
}

export const PlayerDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  
  useEffect(() => {
    const fetchPlayerProfile = async () => {
      if (!profile) return;
      
      try {
        setIsLoading(true);
        
        // Fetch player profile directly linked to this user
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setPlayerProfile(data as PlayerProfile);
        } else {
          toast({
            title: "No linked profile",
            description: "You don't have a linked player profile yet.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error fetching player profile:', error);
        toast({
          variant: "destructive",
          description: "Failed to load your player profile"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerProfile();
  }, [profile, toast]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!playerProfile) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>No Player Profile Linked</CardTitle>
            <CardDescription>
              You need to link your account to a player profile first
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your account isn't linked to any player profile yet. Please use the linking code provided by your team administrator to connect to your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Player Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                {playerProfile.profile_image ? (
                  <img 
                    src={playerProfile.profile_image} 
                    alt={playerProfile.name} 
                    className="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <h2 className="text-xl font-bold mt-3">{playerProfile.name}</h2>
                <p className="text-muted-foreground">#{playerProfile.squad_number}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{playerProfile.age || '--'}</p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium">{playerProfile.player_type === 'GOALKEEPER' ? 'Goalkeeper' : 'Outfield'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="stats">
            <TabsList className="mb-4">
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <ChartLine className="h-4 w-4" />
                <span>Statistics</span>
              </TabsTrigger>
              <TabsTrigger value="fixtures" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Fixtures</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>Achievements</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Player Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Your statistics will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="fixtures">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Fixtures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Your upcoming fixtures will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Player Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Your achievements will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
