
import React from 'react';

type KitColorProps = {
  primaryColor?: string;
  secondaryColor?: string;
  pattern?: string;
  size?: 'small' | 'medium' | 'large';
}

type KitIconProps = {
  value?: string;
  type?: 'home_kit_icon' | 'away_kit_icon' | 'training_kit_icon' | 'home' | 'away' | 'training';
  teamData?: any;
  size?: 'small' | 'medium' | 'large';
}

export const KitIcon: React.FC<KitIconProps> = ({ 
  value, 
  type = 'home_kit_icon',
  teamData,
  size = 'medium' 
}) => {
  // Parse kit colors from value string if provided
  let kitColors: KitColorProps = {};
  let teamNameStr = "Team";
  
  if (value) {
    const parts = value.split('|');
    if (parts.length >= 2) {
      kitColors = {
        primaryColor: parts[0],
        secondaryColor: parts[1],
        pattern: parts[2] || 'solid'
      };
    }
  } else if (teamData) {
    // Map both old and new type values to appropriate column names
    const typeToColumn: Record<string, string> = {
      'home_kit_icon': 'home_kit_icon',
      'away_kit_icon': 'away_kit_icon',
      'training_kit_icon': 'training_kit_icon',
      'home': 'home_kit_icon',
      'away': 'away_kit_icon',
      'training': 'training_kit_icon'
    };
    
    const data = teamData;
    
    if (data && typeof data === 'object') {
      // Extract kit colors if data exists
      const mappedType = typeToColumn[type] || 'home_kit_icon';
      
      if (data[mappedType]) {
        const iconData = data[mappedType];
        
        // Safely extract team name with proper null checking
        if ('team_name' in data && data.team_name !== null) {
          teamNameStr = String(data.team_name);
        }
        
        if (iconData) {
          const parts = iconData.split('|');
          if (parts.length >= 2) {
            kitColors = {
              primaryColor: parts[0],
              secondaryColor: parts[1],
              pattern: parts[2] || 'solid'
            };
          }
        }
      }
    }
  }
  
  const { primaryColor = '#ffffff', secondaryColor = '#000000', pattern = 'solid' } = kitColors;
  
  // Size mappings - handle numeric sizes by converting them to string size
  const sizeMap = {
    small: {
      width: '24px',
      height: '24px',
      borderWidth: '1px'
    },
    medium: {
      width: '32px',
      height: '32px',
      borderWidth: '1px'
    },
    large: {
      width: '48px',
      height: '48px',
      borderWidth: '2px'
    }
  };
  
  // Convert numeric size to string size if needed
  let sizeKey = size;
  if (typeof size === 'number') {
    if (size <= 24) sizeKey = 'small';
    else if (size <= 36) sizeKey = 'medium';
    else sizeKey = 'large';
  }
  
  const { width, height, borderWidth } = sizeMap[sizeKey as keyof typeof sizeMap];
  
  // Render pattern based on type
  let patternStyle: React.CSSProperties = { backgroundColor: primaryColor };
  
  switch (pattern) {
    case 'stripes':
      patternStyle = {
        backgroundColor: primaryColor,
        backgroundImage: `repeating-linear-gradient(90deg, ${secondaryColor}, ${secondaryColor} 4px, ${primaryColor} 4px, ${primaryColor} 12px)`
      };
      break;
    case 'hoops':
      patternStyle = {
        backgroundColor: primaryColor,
        backgroundImage: `repeating-linear-gradient(0deg, ${secondaryColor}, ${secondaryColor} 4px, ${primaryColor} 4px, ${primaryColor} 12px)`
      };
      break;
    case 'quarters':
      patternStyle = {
        background: `linear-gradient(to right, ${primaryColor} 50%, ${secondaryColor} 50%)`
      };
      break;
    case 'halves':
      patternStyle = {
        background: `linear-gradient(to bottom, ${primaryColor} 50%, ${secondaryColor} 50%)`
      };
      break;
    default:
      // Solid is the default
      patternStyle = { backgroundColor: primaryColor };
  }
  
  return (
    <div 
      className="relative rounded-sm overflow-hidden"
      style={{
        width,
        height,
        border: `${borderWidth} solid #111`,
        ...patternStyle
      }}
      title={teamNameStr}
    />
  );
};
