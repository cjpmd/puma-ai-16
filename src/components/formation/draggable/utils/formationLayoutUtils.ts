
import { FormationFormat } from "../../types";
import { positionDefinitions } from "../../utils/positionDefinitions";

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

// Get formation layout based on format
export const getFormationLayout = (format: FormationFormat): FormationLayout => {
  switch (format) {
    case '5-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'MID', 'ATT'],
        layout: 'grid-cols-3 grid-rows-3',
        slots: [
          { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-3', x: '50%', y: '90%' },
          { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-2', x: '25%', y: '70%' },
          { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-2', x: '75%', y: '70%' },
          { id: 'mid', position: 'MID', gridArea: 'col-start-2 row-start-2', x: '50%', y: '50%' },
          { id: 'att', position: 'ATT', gridArea: 'col-start-2 row-start-1', x: '50%', y: '20%' },
        ]
      };
    case '7-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-3 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: '', x: '50%', y: '90%' },
          { id: 'def-l', position: 'DEF', gridArea: '', x: '25%', y: '75%' },
          { id: 'def-r', position: 'DEF', gridArea: '', x: '75%', y: '75%' },
          { id: 'mid-l', position: 'MID', gridArea: '', x: '30%', y: '50%' },
          { id: 'mid-r', position: 'MID', gridArea: '', x: '70%', y: '50%' },
          { id: 'att-l', position: 'ATT', gridArea: '', x: '35%', y: '25%' },
          { id: 'att-r', position: 'ATT', gridArea: '', x: '65%', y: '25%' },
        ]
      };
    case '9-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-5 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: '', x: '50%', y: '90%' },
          { id: 'def-l', position: 'DEF', gridArea: '', x: '20%', y: '75%' },
          { id: 'def-c', position: 'DEF', gridArea: '', x: '50%', y: '75%' },
          { id: 'def-r', position: 'DEF', gridArea: '', x: '80%', y: '75%' },
          { id: 'mid-l', position: 'MID', gridArea: '', x: '25%', y: '50%' },
          { id: 'mid-c', position: 'MID', gridArea: '', x: '50%', y: '50%' },
          { id: 'mid-r', position: 'MID', gridArea: '', x: '75%', y: '50%' },
          { id: 'att-l', position: 'ATT', gridArea: '', x: '35%', y: '25%' },
          { id: 'att-r', position: 'ATT', gridArea: '', x: '65%', y: '25%' },
        ]
      };
    case '11-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-5 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: '', x: '50%', y: '90%' },
          { id: 'def-l', position: 'DEF', gridArea: '', x: '15%', y: '75%' },
          { id: 'def-cl', position: 'DEF', gridArea: '', x: '35%', y: '75%' },
          { id: 'def-cr', position: 'DEF', gridArea: '', x: '65%', y: '75%' },
          { id: 'def-r', position: 'DEF', gridArea: '', x: '85%', y: '75%' },
          { id: 'mid-l', position: 'MID', gridArea: '', x: '20%', y: '50%' },
          { id: 'mid-cl', position: 'MID', gridArea: '', x: '40%', y: '50%' },
          { id: 'mid-cr', position: 'MID', gridArea: '', x: '60%', y: '50%' },
          { id: 'mid-r', position: 'MID', gridArea: '', x: '80%', y: '50%' },
          { id: 'att-l', position: 'ATT', gridArea: '', x: '35%', y: '25%' },
          { id: 'att-r', position: 'ATT', gridArea: '', x: '65%', y: '25%' },
        ]
      };
    default:
      return {
        positions: ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-3 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: '', x: '50%', y: '90%' },
          { id: 'def-l', position: 'DEF', gridArea: '', x: '25%', y: '75%' },
          { id: 'def-r', position: 'DEF', gridArea: '', x: '75%', y: '75%' },
          { id: 'mid-l', position: 'MID', gridArea: '', x: '30%', y: '50%' },
          { id: 'mid-r', position: 'MID', gridArea: '', x: '70%', y: '50%' },
          { id: 'att-l', position: 'ATT', gridArea: '', x: '35%', y: '25%' },
          { id: 'att-r', position: 'ATT', gridArea: '', x: '65%', y: '25%' },
        ]
      };
  }
};

// Helper function to get specific positions for a formation type
export const getPositionsForFormation = (format: FormationFormat): string[] => {
  const layout = getFormationLayout(format);
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
