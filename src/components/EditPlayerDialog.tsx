
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Edit, Check, Upload, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { differenceInYears } from "date-fns";
import { ensureColumnExists, verifyDataSaved } from "@/utils/databaseUtils";

interface EditPlayerDialogProps {
  player: Player;
  onPlayerUpdated: () => void;
}

export const EditPlayerDialog = ({ player, onPlayerUpdated }: EditPlayerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [columnVerified, setColumnVerified] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      // Initialize image preview when dialog opens
      setImagePreview(player.profileImage);
      setSaveAttempted(false);
      
      // Verify column exists when dialog opens
      const verifyColumn = async () => {
        const exists = await ensureColumnExists('players', 'profile_image');
        console.log(`profile_image column verified: ${exists}`);
        setColumnVerified(exists);
        
        if (!exists) {
          toast({
            title: "Database Schema Notice",
            description: "The profile_image column may be missing. Images might not be saved correctly.",
            variant: "destructive",
          });
        }
      };
      
      verifyColumn();
    }
  }, [open, player.profileImage, toast]);

  const form = useForm({
    defaultValues: {
      squadNumber: player.squadNumber,
      playerType: player.playerType,
      dateOfBirth: player.dateOfBirth,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("New image selected:", file.name, file.type, file.size);
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log("Image preview created, length:", result.length);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    console.log("Removing image");
    setImagePreview(null);
    setImageFile(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imagePreview;
    
    setIsUploading(true);
    try {
      console.log("Converting image to base64");
      // Store image as base64 string in the player record
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          console.log("Image converted to base64 string, length:", base64String.length);
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error("Failed to convert image to base64:", error);
          reject(new Error("Failed to convert image to base64"));
        };
        reader.readAsDataURL(imageFile);
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        variant: "destructive",
        description: "Failed to process image",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: any) => {
    setIsSaving(true);
    setSaveAttempted(true);
    try {
      console.log("Starting player update process with values:", values);
      
      // Process image if there's a new one or if it was removed
      let profileImageUrl = imagePreview;
      if (imageFile) {
        console.log("Uploading new image");
        profileImageUrl = await uploadImage();
        if (!profileImageUrl) {
          throw new Error("Failed to process image");
        }
      }
      
      console.log("Ensuring profile_image column exists");
      // Make sure the profile_image column exists
      const hasProfileImage = await ensureColumnExists('players', 'profile_image');
      setColumnVerified(hasProfileImage);
      
      if (!hasProfileImage) {
        console.log("profile_image column doesn't exist, attempting to add it");
        await supabase.rpc('add_column_if_not_exists', {
          p_table_name: 'players',
          p_column_name: 'profile_image',
          p_column_type: 'text'
        });
      }
      
      // Prepare update data
      const updateData: any = {
        squad_number: values.squadNumber,
        player_type: values.playerType,
        date_of_birth: values.dateOfBirth,
      };
      
      // Always include profile_image field, even if null
      updateData.profile_image = profileImageUrl;
      
      // Calculate age based on date of birth
      if (values.dateOfBirth) {
        const age = differenceInYears(new Date(), new Date(values.dateOfBirth));
        updateData.age = age;
        console.log(`Calculated age: ${age} years`);
      }
      
      console.log("Sending update to database:", {
        ...updateData,
        profile_image: updateData.profile_image ? `[base64 string length: ${updateData.profile_image.length}]` : null
      });
      
      // Update player record
      const { data, error } = await supabase
        .from("players")
        .update(updateData)
        .eq("id", player.id)
        .select();

      if (error) {
        console.error("Error updating player:", error);
        throw error;
      }

      console.log("Player updated successfully:", data);
      
      // Verify the data was actually saved
      if (profileImageUrl) {
        const verified = await verifyDataSaved(
          "players", 
          "profile_image", 
          player.id, 
          profileImageUrl
        );
        console.log(`Image save verified: ${verified}`);
        
        if (!verified) {
          console.warn("Image may not have been saved correctly");
          // Continue anyway, but warn user
          toast({
            title: "Warning",
            description: "Your changes were saved, but the profile image may not have uploaded correctly.",
            variant: "destructive",
          });
        }
      }
      
      toast({
        description: "Player details updated successfully",
      });
      
      // Force reload of data
      onPlayerUpdated();
      
      // Small delay to ensure data is refreshed
      setTimeout(() => {
        setIsSaving(false);
        setOpen(false);
      }, 500);
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        variant: "destructive",
        description: "Failed to update player details. Please try again.",
      });
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Player: {player.name}</DialogTitle>
          <DialogDescription>
            Update player details and profile image
            {!columnVerified && saveAttempted && (
              <span className="text-red-500 block mt-1">
                Warning: Database column issues detected. Images may not save.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {/* Image Upload Section */}
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-primary/20">
              {imagePreview ? (
                <AvatarImage src={imagePreview} alt={player.name} />
              ) : (
                <AvatarFallback className="text-2xl font-bold">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            {imagePreview && (
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById('player-image-upload')?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {imagePreview ? 'Change Photo' : 'Upload Photo'}
            </Button>
            <input
              id="player-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="squadNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Squad Number</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="playerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GOALKEEPER">Goalkeeper</SelectItem>
                      <SelectItem value="OUTFIELD">Outfield</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className={`w-full transition-all ${isSaving ? 'bg-green-500 hover:bg-green-600' : ''}`}
              disabled={isSaving || isUploading}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : isUploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading image...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
