
import { FormationFormat } from "../../types";
import { positionDefinitions } from "../../utils/positionDefinitions";
import { FORMATION_7_A_SIDE, FORMATION_9_A_SIDE } from "../../utils/formationTemplates";

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
  
  // Apply template if specified
  if (template && template !== "All") {
    if (format === "7-a-side") {
      customPositions = FORMATION_7_A_SIDE[template as keyof typeof FORMATION_7_A_SIDE] || [];
    } else if (format === "9-a-side") {
      customPositions = FORMATION_9_A_SIDE[template as keyof typeof FORMATION_9_A_SIDE] || [];
    }
  }
  
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
  const slots = positions.map(pos => {
    const id = pos.toLowerCase();
    const posData = positionDefinitions[pos];
    
    if (!posData) {
      console.warn(`Position ${pos} not found in definitions`);
      return {
        id,
        position: pos,
        gridArea: '',
        x: '50%',
        y: '50%'
      };
    }
    
    return {
      id,
      position: pos,
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
    console.warn(`Position ${pos} not found in definitions`);
    return { x: '50%', y: '50%' };
  }
  
  return { x: posData.x, y: posData.y };
};
