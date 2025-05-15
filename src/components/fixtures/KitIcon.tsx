
import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KitIconProps {
  type: 'home' | 'away' | 'training';
  size?: number;
}

export function KitIcon({ type, size = 24 }: KitIconProps) {
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [pattern, setPattern] = useState<"solid" | "stripes" | "hoops">("solid");
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipText, setTooltipText] = useState("");

  // Map type to database column
  const typeToColumn = {
    'home': 'home_kit_icon',
    'away': 'away_kit_icon',
    'training': 'training_kit_icon'
  };

  // Map type to display text
  const typeToText = {
    'home': 'Home Kit',
    'away': 'Away Kit', 
    'training': 'Training Kit'
  };

  useEffect(() => {
    const fetchKitIcon = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('team_settings')
          .select(`team_name, ${typeToColumn[type]}`)
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching kit icon:', error);
          setTooltipText(typeToText[type]); // Default tooltip when error occurs
          return;
        }

        // Default tooltip text if we can't extract team name
        let teamNameStr = "";
        
        if (data) {
          // Safely access the icon data
          const iconData = data?.[typeToColumn[type]];
          
          // Safely extract team name with proper null checking
          if (typeof data === 'object' && data !== null && 'team_name' in data && data.team_name !== null) {
            teamNameStr = String(data.team_name);
          }
          
          if (iconData) {
            // Format: primaryColor|secondaryColor|pattern
            const iconParts = iconData.split('|');
            
            // Set primary and secondary colors
            setPrimaryColor(iconParts[0] || "#ffffff");
            setSecondaryColor(iconParts[1] || "#000000");
            
            // Set pattern if available (backward compatible with old format)
            if (iconParts.length > 2) {
              setPattern(iconParts[2] as "solid" | "stripes" | "hoops" || "solid");
            } else {
              setPattern("solid");
            }
            
            // Set tooltip text including team name if available
            setTooltipText(teamNameStr 
              ? `${teamNameStr} ${typeToText[type]}` 
              : typeToText[type]);
          } else {
            // Default tooltip text when iconData is not available
            setTooltipText(typeToText[type]);
          }
        } else {
          // Handle case where data is null
          setTooltipText(typeToText[type]);
        }
      } catch (error) {
        console.error('Error fetching kit icon:', error);
        // Set default tooltip text in case of error
        setTooltipText(typeToText[type]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKitIcon();
  }, [type]);

  if (isLoading) {
    return <div className="animate-pulse w-6 h-6 bg-gray-200 rounded-full" />;
  }

  // Create SVG patterns based on the selected pattern type
  const getShirtStyle = () => {
    switch (pattern) {
      case "stripes":
        return {
          fill: `url(#stripes-${type})`,
          color: secondaryColor,
        };
      case "hoops":
        return {
          fill: `url(#hoops-${type})`,
          color: secondaryColor,
        };
      default:
        return {
          fill: primaryColor,
          color: secondaryColor,
        };
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="relative">
            <svg width="0" height="0" style={{ position: "absolute" }}>
              <defs>
                {/* Vertical stripes pattern */}
                <pattern
                  id={`stripes-${type}`}
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                  patternTransform="rotate(90)"
                >
                  <rect width="5" height="10" fill={primaryColor} />
                  <rect x="5" width="5" height="10" fill={secondaryColor} />
                </pattern>
                
                {/* Horizontal hoops pattern */}
                <pattern
                  id={`hoops-${type}`}
                  patternUnits="userSpaceOnUse"
                  width="10"
                  height="10"
                >
                  <rect width="10" height="5" fill={primaryColor} />
                  <rect y="5" width="10" height="5" fill={secondaryColor} />
                </pattern>
              </defs>
            </svg>
            <Shirt 
              size={size}
              className="text-slate-800"
              {...getShirtStyle()}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
