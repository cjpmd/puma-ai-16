
import { useState, useEffect } from "react";
import { AttributeSettingsManager } from "@/components/settings/AttributeSettingsManager";
import { FAConnectionSettings } from "@/components/settings/FAConnectionSettings";
import { WhatsAppIntegration } from "@/components/settings/WhatsAppIntegration";
import { TeamInfoSettings } from "@/components/settings/TeamInfoSettings";
import { FormatsAndCategoriesSettings } from "@/components/settings/FormatsAndCategoriesSettings";
import { JoinClubSection } from "@/components/settings/JoinClubSection";
import { PlayerSubscriptionManager } from "@/components/subscription/PlayerSubscriptionManager";
import { TeamPlatformSubscription } from "@/components/subscription/TeamPlatformSubscription";
import { ActiveSubscriptionsTable } from "@/components/subscription/ActiveSubscriptionsTable";
import { TeamUsersManager } from "@/components/settings/TeamUsersManager";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, CreditCard, Plus } from "lucide-react";

export default function TeamSettings() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [teamId, setTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [clubInfo, setClubInfo] = useState<any>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    const checkTables = async () => {
      try {
        // Check performance_categories table
        const { data: categories, error: catError } = await supabase
          .from('performance_categories')
          .select('*');
        
        if (catError) {
          console.error('Error fetching performance categories:', catError);
        }
        
        // Check game_formats table
        const { data: formats, error: formatError } = await supabase
          .from('game_formats')
          .select('*');
          
        if (formatError) {
          console.error('Error fetching game formats:', formatError);
        }

        // Update debug info
        setDebugInfo({
          categories: categories || [],
          formats: formats || [],
          categoryError: catError?.message || null,
          formatError: formatError?.message || null
        });
        
        // Check tables and ensure they exist with default data
        if (!categories || categories.length === 0 || catError) {
          await createDefaultCategories();
        }
        
        if (!formats || formats.length === 0 || formatError) {
          await createDefaultFormats();
        }
      } catch (error) {
        console.error('Error in checkTables:', error);
        setDebugInfo(prev => ({ ...prev, error: String(error) }));
      }
    };
    
    checkTables();
    fetchTeamAndClubData();
  }, [profile]);

  const fetchTeamAndClubData = async () => {
    if (!profile) return;
    
    try {
      console.log("Fetching team data for user:", profile.id);
      
      // Check if user has a team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, clubs(*)')
        .eq('admin_id', profile.id)
        .maybeSingle();
        
      if (teamError) {
        console.error('Error fetching team data:', teamError);
        throw teamError;
      }
      
      console.log("Team data fetched:", teamData);
      
      // Also fetch team settings to get the custom team name if it exists
      const { data: teamSettings } = await supabase
        .from('team_settings')
        .select('team_name, team_colors')
        .maybeSingle();
        
      if (teamData) {
        setTeamId(teamData.id);
        console.log("Setting team ID:", teamData.id);
        
        // Use team_name from team_settings if available, otherwise use the default team name
        const displayName = teamSettings?.team_name || teamData.team_name;
        setTeamName(displayName);
        
        // If team data exists but doesn't have age_group, update it from team_settings
        if (teamSettings?.team_colors && (!teamData.age_group || teamData.age_group === "")) {
          await supabase
            .from('teams')
            .update({
              age_group: teamSettings.team_colors
            })
            .eq('id', teamData.id);
        }
        
        if (teamData.club_id) {
          setClubInfo(teamData.clubs);
          console.log("Setting club info:", teamData.clubs);
        } else {
          console.log("No club associated with this team");
        }
      } else {
        console.log("No team found for this user");
        
        // Create a default team for the user if none exists
        await createDefaultTeam();
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };
  
  // Add function to create a default team if the user doesn't have one
  const createDefaultTeam = async () => {
    try {
      if (!profile) return;
      
      console.log("Creating default team for user:", profile.id);
      
      // Get team settings first if they exist
      const { data: teamSettings } = await supabase
        .from('team_settings')
        .select('team_name, team_colors')
        .maybeSingle();
      
      const { data: newTeam, error } = await supabase
        .from('teams')
        .insert({
          team_name: teamSettings?.team_name || 'My Team',
          age_group: teamSettings?.team_colors || '', // Use team_colors as age_group
          admin_id: profile.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating default team:', error);
        return;
      }
      
      console.log("Created default team:", newTeam);
      setTeamId(newTeam.id);
      setTeamName(newTeam.team_name);
      
      // Also ensure there's an entry in team_settings
      await ensureTeamSettings();
    } catch (error) {
      console.error('Error in createDefaultTeam:', error);
    }
  };
  
  // Ensure team_settings table has an entry
  const ensureTeamSettings = async () => {
    try {
      const { data: existingSettings } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();
        
      if (!existingSettings) {
        await supabase.from('team_settings').insert({
          team_name: 'My Team',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error ensuring team settings:', error);
    }
  };

  const createDefaultCategories = async () => {
    try {
      // First try to create the table using the SQL API
      // We need to use the REST API since we can't directly execute SQL queries
      // Try to insert the default data directly
      const { error } = await supabase
        .from('performance_categories')
        .upsert([
          { id: 'messi', name: 'Messi', description: 'Messi performance category' },
          { id: 'ronaldo', name: 'Ronaldo', description: 'Ronaldo performance category' },
          { id: 'jags', name: 'Jags', description: 'Jags performance category' }
        ], { onConflict: 'id' });
        
      if (error) {
        console.error('Error creating default categories:', error);
        
        // If the error indicates the table doesn't exist, try to create it using a function
        // For demo purposes, we'll create a new RPC function call
        const { data, error: rpcError } = await supabase.rpc('create_performance_categories_table');
        
        if (rpcError) {
          console.error('Error creating performance_categories table via RPC:', rpcError);
        } else {
          // Try to insert again after table creation
          const { error: retryError } = await supabase
            .from('performance_categories')
            .upsert([
              { id: 'messi', name: 'Messi', description: 'Messi performance category' },
              { id: 'ronaldo', name: 'Ronaldo', description: 'Ronaldo performance category' },
              { id: 'jags', name: 'Jags', description: 'Jags performance category' }
            ], { onConflict: 'id' });
            
          if (retryError) {
            console.error('Error in retry insert of default categories:', retryError);
          }
        }
      }
    } catch (error) {
      console.error('Error in createDefaultCategories:', error);
    }
  };
  
  const createDefaultFormats = async () => {
    try {
      // Try to insert the default data directly
      const { error } = await supabase
        .from('game_formats')
        .upsert([
          { id: '4-a-side', name: '4-a-side', description: '4 players per team' },
          { id: '5-a-side', name: '5-a-side', description: '5 players per team' },
          { id: '7-a-side', name: '7-a-side', description: '7 players per team' },
          { id: '9-a-side', name: '9-a-side', description: '9 players per team' },
          { id: '11-a-side', name: '11-a-side', description: '11 players per team' }
        ], { onConflict: 'id' });
        
      if (error) {
        console.error('Error creating default formats:', error);
        
        // If the error indicates the table doesn't exist, try to create it using a function
        const { data, error: rpcError } = await supabase.rpc('create_game_formats_table');
        
        if (rpcError) {
          console.error('Error creating game_formats table via RPC:', rpcError);
        } else {
          // Try to insert again after table creation
          const { error: retryError } = await supabase
            .from('game_formats')
            .upsert([
              { id: '4-a-side', name: '4-a-side', description: '4 players per team' },
              { id: '5-a-side', name: '5-a-side', description: '5 players per team' },
              { id: '7-a-side', name: '7-a-side', description: '7 players per team' },
              { id: '9-a-side', name: '9-a-side', description: '9 players per team' },
              { id: '11-a-side', name: '11-a-side', description: '11 players per team' }
            ], { onConflict: 'id' });
            
          if (retryError) {
            console.error('Error in retry insert of default formats:', retryError);
          }
        }
      }
    } catch (error) {
      console.error('Error in createDefaultFormats:', error);
    }
  };

  const handleClubJoined = async () => {
    await fetchTeamAndClubData();
  };
  
  // Function to handle team info updates
  const handleTeamInfoUpdated = async () => {
    await fetchTeamAndClubData();
  };

  return (
    <>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {teamName ? `${teamName} Settings` : "Team Settings"}
          </h1>
          
          <div className="flex gap-2">
            {profile?.role === 'admin' && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/club-settings")}
              >
                Club Management
              </Button>
            )}
            
            <Button 
              onClick={() => navigate("/create-club")}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create Club</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Player Attributes</span>
            </TabsTrigger>
            {(profile?.role === 'admin' || profile?.role === 'globalAdmin') && (
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <TeamInfoSettings onTeamInfoUpdated={handleTeamInfoUpdated} />
            
            {teamId ? (
              <JoinClubSection 
                teamId={teamId} 
                currentClub={clubInfo} 
                onClubJoined={handleClubJoined} 
              />
            ) : (
              <div className="p-4 border rounded-md bg-yellow-50">
                <p className="text-amber-700">Loading team information...</p>
              </div>
            )}
            
            <FormatsAndCategoriesSettings />
            <FAConnectionSettings />
            <WhatsAppIntegration />
          </TabsContent>
          
          <TabsContent value="subscriptions" className="space-y-6">
            <TeamPlatformSubscription />
            <ActiveSubscriptionsTable />
            <PlayerSubscriptionManager />
          </TabsContent>
          
          <TabsContent value="attributes">
            <AttributeSettingsManager />
          </TabsContent>
          
          {(profile?.role === 'admin' || profile?.role === 'globalAdmin') && (
            <TabsContent value="users">
              <TeamUsersManager />
            </TabsContent>
          )}
        </Tabs>
        
        {/* Debug information - can be removed in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 border rounded-md bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({teamId, teamName, clubInfo: !!clubInfo, profile: !!profile}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
