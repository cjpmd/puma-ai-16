
import { FormationFormat } from "../../types";
import { positionDefinitions } from "../../utils/positionDefinitions";
import { FORMATION_7_A_SIDE, FORMATION_9_A_SIDE, FORMATION_5_A_SIDE, FORMATION_11_A_SIDE } from "../../utils/formationTemplates";

interface FormationSlot {
  id: string;
  position: string;
  gridArea: string;
  x: string;
  y: string;
}

interface FormationLayout {
  positions: string[];
  layout: string;
  slots: FormationSlot[];
}

// Get formation layout based on format and template
export const getFormationLayout = (format: FormationFormat, template?: string): FormationLayout => {
  let defaultPositions: string[] = [];
  let customPositions: string[] = [];
  
  console.log(`Getting formation layout for format: ${format}, template: ${template}`);
  
  // If the All template is selected, return all available positions for the format
  if (template === "All") {
    switch (format) {
      case '5-a-side':
        customPositions = FORMATION_5_A_SIDE[template];
        break;
      case '7-a-side':
        customPositions = FORMATION_7_A_SIDE[template];
        break;
      case '9-a-side':
        customPositions = FORMATION_9_A_SIDE[template];
        break;
      case '11-a-side':
        customPositions = FORMATION_11_A_SIDE[template];
        break;
      default:
        customPositions = FORMATION_7_A_SIDE[template] || [];
    }
  } 
  // Apply specific template if specified
  else if (template && template !== "All") {
    if (format === "7-a-side") {
      customPositions = FORMATION_7_A_SIDE[template as keyof typeof FORMATION_7_A_SIDE] || [];
    } else if (format === "9-a-side") {
      customPositions = FORMATION_9_A_SIDE[template as keyof typeof FORMATION_9_A_SIDE] || [];
    } else if (format === "5-a-side") {
      customPositions = FORMATION_5_A_SIDE[template as keyof typeof FORMATION_5_A_SIDE] || [];
    } else if (format === "11-a-side") {
      customPositions = FORMATION_11_A_SIDE[template as keyof typeof FORMATION_11_A_SIDE] || [];
    }
  }
  
  // Set default positions based on format
  switch (format) {
    case '5-a-side':
      defaultPositions = ['GK', 'DL', 'DR', 'MC', 'STC'];
      break;
    case '7-a-side':
      defaultPositions = ['GK', 'DL', 'DC', 'DR', 'ML', 'MC', 'MR'];
      break;
    case '9-a-side':
      defaultPositions = ['GK', 'DL', 'DCL', 'DCR', 'DR', 'MC', 'ML', 'MR', 'STC'];
      break;
    case '11-a-side':
      defaultPositions = ['GK', 'DL', 'DCL', 'DCR', 'DR', 'ML', 'MC', 'MR', 'AML', 'STC', 'AMR'];
      break;
    default:
      defaultPositions = ['GK', 'DL', 'DC', 'DR', 'ML', 'MC', 'MR', 'STC'];
  }
  
  // Use template positions if available, otherwise use default
  const positions = customPositions.length > 0 ? customPositions : defaultPositions;
  
  console.log(`Positions selected for formation: ${positions.join(', ')}`);
  
  // Generate slots based on positions
  const slots = positions.map(position => {
    const id = position.toLowerCase();
    const posData = positionDefinitions[position];
    
    if (!posData) {
      console.warn(`Position ${position} not found in definitions`);
      return {
        id,
        position,
        gridArea: '',
        x: '50%',
        y: '50%'
      };
    }
    
    return {
      id,
      position,
      gridArea: '',
      x: posData.x,
      y: posData.y
    };
  });
  
  console.log(`Created ${slots.length} slots from positions`);
  
  return {
    positions,
    layout: `grid-cols-${format === '5-a-side' ? 3 : 5} grid-rows-4`,
    slots
  };
};

// Helper function to get specific positions for a formation type
export const getPositionsForFormation = (format: FormationFormat, template?: string): string[] => {
  const layout = getFormationLayout(format, template);
  return layout.positions;
};

// Get position coordinates
export const getPositionCoordinates = (position: string): { x: string, y: string } => {
  const posData = positionDefinitions[position];
  if (!posData) {
    console.warn(`Position ${position} not found in definitions`);
    return { x: '50%', y: '50%' };
  }
  
  return { x: posData.x, y: posData.y };
};
