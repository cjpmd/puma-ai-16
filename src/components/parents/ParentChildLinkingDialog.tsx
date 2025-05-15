
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";

const linkPlayerSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
});

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  team?: {
    team_name: string;
  };
}

export const ParentChildLinkingDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const form = useForm<z.infer<typeof linkPlayerSchema>>({
    resolver: zodResolver(linkPlayerSchema),
    defaultValues: {
      playerName: "",
    },
  });

  const searchPlayers = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Search for players by name
      const { data, error } = await supabase
        .from('players')
        .select(`
          id,
          first_name,
          last_name,
          teams (
            team_name
          )
        `)
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      
      setSearchResults(data || []);
      
      if (data?.length === 0) {
        toast({
          description: "No players found matching your search",
        });
      }
    } catch (error) {
      console.error('Error searching players:', error);
      toast({
        variant: "destructive",
        description: "Failed to search for players",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const linkPlayerToParent = async () => {
    if (!selectedPlayer || !profile?.id) return;
    
    setIsLinking(true);
    try {
      // First check if link already exists
      const { data: existingLink, error: checkError } = await supabase
        .from('player_parents')
        .select('id')
        .eq('player_id', selectedPlayer.id)
        .eq('parent_id', profile.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingLink) {
        toast({
          description: "You're already linked to this player",
        });
        setIsOpen(false);
        return;
      }
      
      // Create new link between parent and player
      const { error } = await supabase
        .from('player_parents')
        .insert([
          { 
            player_id: selectedPlayer.id, 
            parent_id: profile.id,
            name: profile.email,
            email: profile.email
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Successfully linked to ${selectedPlayer.first_name} ${selectedPlayer.last_name}`,
      });
      
      setIsOpen(false);
      setSelectedPlayer(null);
      setSearchTerm("");
    } catch (error) {
      console.error('Error linking player:', error);
      toast({
        variant: "destructive",
        description: "Failed to link player to your account",
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Link to Player
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Player</DialogTitle>
            <DialogDescription>
              Search for a player to link to your parent account
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {!selectedPlayer ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Search player name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={searchPlayers}
                    disabled={isSearching || !searchTerm.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {isSearching ? (
                  <div className="text-center py-4">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((player) => (
                      <div 
                        key={player.id} 
                        className="flex justify-between items-center p-3 border rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div>
                          <div className="font-medium">{player.first_name} {player.last_name}</div>
                          {player.team && <div className="text-sm text-muted-foreground">{player.team.team_name}</div>}
                        </div>
                        <Button variant="ghost" size="sm">Select</Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="font-medium">Selected Player:</div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <div>{selectedPlayer.first_name} {selectedPlayer.last_name}</div>
                      {selectedPlayer.team && <div className="text-sm text-muted-foreground">{selectedPlayer.team.team_name}</div>}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedPlayer(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>
                    Linking to this player will give you parent access to view their information and manage their subscriptions.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {selectedPlayer && (
              <Button 
                onClick={linkPlayerToParent} 
                disabled={isLinking}
              >
                <Users className="mr-2 h-4 w-4" />
                {isLinking ? 'Linking...' : 'Link to Player'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
