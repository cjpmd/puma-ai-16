
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const teamFormSchema = z.object({
  team_name: z.string().min(3, "Team name must be at least 3 characters"),
  age_group: z.string().min(1, "Please select an age group"),
  location: z.string().optional(),
  contact_email: z.string().email("Please enter a valid email"),
  team_color: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export default function CreateTeam() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      team_name: "",
      age_group: "",
      location: "",
      contact_email: profile?.email || "",
      team_color: "",
    },
  });

  const onSubmit = async (values: TeamFormValues) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to create a team",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user already has a team
      const { data: existingTeam, error: checkError } = await supabase
        .from('teams')
        .select('id')
        .eq('admin_id', profile.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingTeam) {
        toast({
          title: "Team Already Exists",
          description: "You already have a team. You can only create one team per account.",
          variant: "destructive",
        });
        return;
      }
      
      // Create the team
      const { data, error } = await supabase
        .from('teams')
        .insert({
          team_name: values.team_name,
          age_group: values.age_group,
          location: values.location,
          contact_email: values.contact_email,
          team_color: values.team_color,
          admin_id: profile.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Team Created",
        description: "Your team has been created successfully",
      });
      
      // Redirect to the home page
      navigate("/home");
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Team</CardTitle>
          <CardDescription>
            Set up your team to start managing players, fixtures, and training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="team_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age_group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-7">Under 7</SelectItem>
                        <SelectItem value="under-8">Under 8</SelectItem>
                        <SelectItem value="under-9">Under 9</SelectItem>
                        <SelectItem value="under-10">Under 10</SelectItem>
                        <SelectItem value="under-11">Under 11</SelectItem>
                        <SelectItem value="under-12">Under 12</SelectItem>
                        <SelectItem value="under-13">Under 13</SelectItem>
                        <SelectItem value="under-14">Under 14</SelectItem>
                        <SelectItem value="under-15">Under 15</SelectItem>
                        <SelectItem value="under-16">Under 16</SelectItem>
                        <SelectItem value="under-17">Under 17</SelectItem>
                        <SelectItem value="under-18">Under 18</SelectItem>
                        <SelectItem value="adult">Adult</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="Enter team location" {...field} />
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
                name="team_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Color</FormLabel>
                    <FormControl>
                      <Input 
                        type="color" 
                        placeholder="Select team color" 
                        {...field} 
                        className="h-10 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Team..." : "Create Team"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
