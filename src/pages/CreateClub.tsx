
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateClub() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact_email: "",
    phone: "",
    website: "",
    description: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!profile) {
      setError("You must be logged in to create a club");
      return;
    }
    
    if (!formData.name.trim()) {
      setError("Club name is required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a unique serial number for the club
      const serialNumber = nanoid(8).toUpperCase();
      
      const { data, error } = await supabase
        .from('clubs')
        .insert([
          {
            name: formData.name,
            location: formData.location,
            contact_email: formData.contact_email || profile.email,
            phone: formData.phone,
            website: formData.website,
            description: formData.description,
            admin_id: profile.id,
            serial_number: serialNumber
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Club created successfully",
      });
      
      navigate("/club-settings");
    } catch (err) {
      console.error("Error creating club:", err);
      setError("Failed to create club. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create a Club</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new club and manage multiple teams
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Club Details</CardTitle>
          <CardDescription>
            Enter the information about your club. You can edit these details later.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Club Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter club name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="contact@yourclub.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourclub.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your club..."
                rows={4}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Club"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
