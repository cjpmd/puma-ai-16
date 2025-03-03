
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Edit, Check, Upload, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { differenceInYears } from "date-fns";

interface EditPlayerDialogProps {
  player: Player;
  onPlayerUpdated: () => void;
}

export const EditPlayerDialog = ({ player, onPlayerUpdated }: EditPlayerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(player.profileImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return player.profileImage || null;
    
    setIsUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${player.id}-${Date.now()}.${fileExt}`;
      const filePath = `player-images/${fileName}`;
      
      console.log("Creating bucket if it doesn't exist...");
      // Create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage
        .createBucket('player-assets', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (bucketError && bucketError.message !== 'Bucket already exists') {
        console.error("Error creating bucket:", bucketError);
        throw bucketError;
      }
      
      console.log("Uploading file to bucket...");
      const { error: uploadError } = await supabase.storage
        .from('player-assets')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Getting public URL...");
      const { data: urlData } = supabase.storage
        .from('player-assets')
        .getPublicUrl(filePath);
      
      console.log("Public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        description: "Failed to upload image",
      });
      return player.profileImage || null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: any) => {
    setIsSaving(true);
    try {
      // Upload image if there's a new one
      console.log("Starting image upload process...");
      const profileImage = await uploadImage();
      console.log("Image uploaded, URL:", profileImage);
      
      // Calculate age based on date of birth
      const age = differenceInYears(new Date(), new Date(values.dateOfBirth));
      
      console.log("Updating player record with profile image:", profileImage);
      const { error } = await supabase
        .from("players")
        .update({
          squad_number: values.squadNumber,
          player_type: values.playerType,
          date_of_birth: values.dateOfBirth,
          profile_image: profileImage,
          age: age // Update age based on the date of birth
        })
        .eq("id", player.id);

      if (error) throw error;

      toast({
        description: "Player details updated successfully",
      });
      
      onPlayerUpdated();
      setTimeout(() => {
        setIsSaving(false);
        setOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        variant: "destructive",
        description: "Failed to update player details",
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
              <Upload className="h-4 w-4 mr-2" />
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
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              ) : isUploading ? (
                <span className="flex items-center gap-2">
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
