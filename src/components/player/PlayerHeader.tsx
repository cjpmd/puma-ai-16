
import { Player } from "@/types/player";
import { EditPlayerDialog } from "@/components/EditPlayerDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { columnExists } from "@/utils/database";

interface PlayerHeaderProps {
  player: Player;
  topPositions?: any[];
  showAttributeVisuals: boolean;
  onPlayerUpdated?: () => void;
}

export const PlayerHeader = ({ 
  player, 
  topPositions, 
  showAttributeVisuals,
  onPlayerUpdated = () => window.location.reload()
}: PlayerHeaderProps) => {
  const [imageError, setImageError] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(player.profileImage);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [columnAvailable, setColumnAvailable] = useState(false);
  
  // Check if profile_image column exists
  useEffect(() => {
    const checkProfileImageColumn = async () => {
      try {
        const exists = await columnExists('players', 'profile_image');
        console.log(`Profile image column exists: ${exists}`);
        setColumnAvailable(exists);
        
        if (!exists && profileImage) {
          console.log("Profile image column doesn't exist but we have an image - using local state");
        }
      } catch (error) {
        console.error("Error checking profile image column:", error);
        setColumnAvailable(false);
      }
    };
    
    checkProfileImageColumn();
  }, [profileImage]);
  
  // Fetch the latest profile image when player data changes or after updates
  useEffect(() => {
    const fetchLatestProfileImage = async () => {
      try {
        // First set the image from props
        if (player.profileImage) {
          console.log("Using player prop profile image");
          setProfileImage(player.profileImage);
          setImageError(false);
          return;
        }
        
        // Only try to fetch from database if column exists
        if (columnAvailable) {
          console.log("Fetching profile image for player:", player.id);
          
          const { data, error } = await supabase
            .from('players')
            .select('profile_image')
            .eq('id', player.id)
            .single();
            
          if (error) {
            console.error("Error fetching profile image:", error);
            
            // If column doesn't exist, we'll get an error here
            if (error.message.includes('does not exist')) {
              console.log("profile_image column doesn't exist, using default");
              setProfileImage(null);
            }
            return;
          }
          
          if (data && data.profile_image) {
            console.log("Got latest profile image from database");
            setProfileImage(data.profile_image);
            setImageError(false);
            return;
          }
        }
        
        console.log("No profile image found");
        setProfileImage(null);
      } catch (error) {
        console.error("Failed to fetch latest profile image:", error);
        // Fallback to the prop
        setProfileImage(player.profileImage);
      }
    };
    
    fetchLatestProfileImage();
  }, [player.id, player.profileImage, lastUpdate, columnAvailable]);
  
  const handlePlayerUpdated = () => {
    console.log("Player updated, refreshing data");
    setLastUpdate(Date.now());
    onPlayerUpdated();
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          {profileImage && !imageError ? (
            <AvatarImage 
              src={profileImage} 
              alt={player.name} 
              onError={(e) => {
                console.error("Error loading image:", e);
                setImageError(true);
              }} 
            />
          ) : (
            <AvatarFallback className="text-3xl font-bold">
              {player.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <Badge variant="outline">{player.age} yrs</Badge>
            <Badge variant="outline">#{player.squadNumber}</Badge>
          </div>
          
          {showAttributeVisuals && topPositions && topPositions.length > 0 && (
            <div className="flex gap-2 mt-1">
              {topPositions.slice(0, 3).map((pos, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`${index === 0 ? 'bg-green-500/10' : index === 1 ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}
                >
                  {pos.role_definitions?.abbreviation || pos.position} 
                  {pos.suitability_score && ` (${Number(pos.suitability_score).toFixed(1)}%)`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <EditPlayerDialog player={player} onPlayerUpdated={handlePlayerUpdated} />
    </div>
  );
};
