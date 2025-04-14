
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const clubFormSchema = z.object({
  club_name: z.string().min(3, "Club name must be at least 3 characters"),
  location: z.string().optional(),
  contact_email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});

type ClubFormValues = z.infer<typeof clubFormSchema>;

export default function ClubSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      club_name: "",
      location: "",
      contact_email: "",
      phone: "",
      website: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    
    const fetchClubAndTeams = async () => {
      try {
        // Fetch club data if the user is an admin of a club
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (clubError) throw clubError;
        
        if (clubData) {
          setClub(clubData);
          form.reset({
            club_name: clubData.name || "",
            location: clubData.location || "",
            contact_email: clubData.contact_email || "",
            phone: clubData.phone || "",
            website: clubData.website || "",
            description: clubData.description || "",
          });
          
          // Fetch teams associated with this club
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .eq('club_id', clubData.id);
            
          if (teamsError) throw teamsError;
          setTeams(teamsData || []);
        }
      } catch (err) {
        console.error("Error fetching club data:", err);
        setError("Failed to load club data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubAndTeams();
  }, [profile, form]);
  
  const onSubmit = async (values: ClubFormValues) => {
    try {
      if (!profile) {
        toast({
          title: "Error",
          description: "You must be logged in to create or update a club",
          variant: "destructive",
        });
        return;
      }
      
      if (club) {
        // Update existing club
        const { error } = await supabase
          .from('clubs')
          .update({
            name: values.club_name,
            location: values.location,
            contact_email: values.contact_email,
            phone: values.phone,
            website: values.website,
            description: values.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', club.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Club information updated successfully",
        });
      } else {
        // Create new club
        const { data, error } = await supabase
          .from('clubs')
          .insert({
            name: values.club_name,
            location: values.location,
            contact_email: values.contact_email,
            phone: values.phone,
            website: values.website,
            description: values.description,
            admin_id: profile.id,
            serial_number: generateSerialNumber(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setClub(data);
        toast({
          title: "Success",
          description: "Club created successfully",
        });
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving club:", err);
      toast({
        title: "Error",
        description: "Failed to save club information",
        variant: "destructive",
      });
    }
  };
  
  // Generate a unique serial number for clubs
  const generateSerialNumber = () => {
    const prefix = "CLUB";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };
  
  if (isLoading || loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[80vh]">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Club Settings</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Club Information</CardTitle>
            <CardDescription>
              {club 
                ? "Manage your club details and view connected teams" 
                : "Create a new club to manage multiple teams"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing && club ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Club Name</h3>
                    <p className="text-lg">{club.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p className="text-lg">{club.location || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Contact Email</h3>
                    <p className="text-lg">{club.contact_email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p className="text-lg">{club.phone || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                    <p className="text-lg">
                      {club.website ? (
                        <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {club.website}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Club Serial Number</h3>
                    <p className="text-lg font-mono">{club.serial_number}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share this with teams who want to join your club
                    </p>
                  </div>
                </div>
                
                {club.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="text-lg">{club.description}</p>
                  </div>
                )}
                
                <Button onClick={() => setIsEditing(true)}>Edit Club Information</Button>
              </>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="club_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter club name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter website URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter club description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button type="submit">{club ? "Update Club" : "Create Club"}</Button>
                    {club && (
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        {club && (
          <Card>
            <CardHeader>
              <CardTitle>Connected Teams</CardTitle>
              <CardDescription>
                Teams that are part of your club
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="grid gap-4">
                  {teams.map((team) => (
                    <div key={team.id} className="border rounded-md p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{team.team_name}</h3>
                        <p className="text-sm text-muted-foreground">Joined: {new Date(team.joined_club_at).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/team/${team.id}`)}>
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No teams have joined your club yet.</p>
                  <p className="text-sm mt-2">Share your club serial number with teams to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
