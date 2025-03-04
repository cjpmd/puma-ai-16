
import { FormationFormat } from "../../types";

interface FormationSlot {
  id: string;
  position: string;
  gridArea: string;
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
          { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-3' },
          { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-2' },
          { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-2' },
          { id: 'mid', position: 'MID', gridArea: 'col-start-2 row-start-2' },
          { id: 'att', position: 'ATT', gridArea: 'col-start-2 row-start-1' },
        ]
      };
    case '7-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-3 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-4' },
          { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
          { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-3' },
          { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
          { id: 'mid-r', position: 'MID', gridArea: 'col-start-3 row-start-2' },
          { id: 'att-l', position: 'ATT', gridArea: 'col-start-1 row-start-1' },
          { id: 'att-r', position: 'ATT', gridArea: 'col-start-3 row-start-1' },
        ]
      };
    case '9-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-5 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: 'col-start-3 row-start-4' },
          { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
          { id: 'def-c', position: 'DEF', gridArea: 'col-start-3 row-start-3' },
          { id: 'def-r', position: 'DEF', gridArea: 'col-start-5 row-start-3' },
          { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
          { id: 'mid-c', position: 'MID', gridArea: 'col-start-3 row-start-2' },
          { id: 'mid-r', position: 'MID', gridArea: 'col-start-5 row-start-2' },
          { id: 'att-l', position: 'ATT', gridArea: 'col-start-2 row-start-1' },
          { id: 'att-r', position: 'ATT', gridArea: 'col-start-4 row-start-1' },
        ]
      };
    case '11-a-side':
      return {
        positions: ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-5 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: 'col-start-3 row-start-4' },
          { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
          { id: 'def-cl', position: 'DEF', gridArea: 'col-start-2 row-start-3' },
          { id: 'def-cr', position: 'DEF', gridArea: 'col-start-4 row-start-3' },
          { id: 'def-r', position: 'DEF', gridArea: 'col-start-5 row-start-3' },
          { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
          { id: 'mid-cl', position: 'MID', gridArea: 'col-start-2 row-start-2' },
          { id: 'mid-cr', position: 'MID', gridArea: 'col-start-4 row-start-2' },
          { id: 'mid-r', position: 'MID', gridArea: 'col-start-5 row-start-2' },
          { id: 'att-l', position: 'ATT', gridArea: 'col-start-2 row-start-1' },
          { id: 'att-r', position: 'ATT', gridArea: 'col-start-4 row-start-1' },
        ]
      };
    default:
      return {
        positions: ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'],
        layout: 'grid-cols-3 grid-rows-4',
        slots: [
          { id: 'gk', position: 'GK', gridArea: 'col-start-2 row-start-4' },
          { id: 'def-l', position: 'DEF', gridArea: 'col-start-1 row-start-3' },
          { id: 'def-r', position: 'DEF', gridArea: 'col-start-3 row-start-3' },
          { id: 'mid-l', position: 'MID', gridArea: 'col-start-1 row-start-2' },
          { id: 'mid-r', position: 'MID', gridArea: 'col-start-3 row-start-2' },
          { id: 'att-l', position: 'ATT', gridArea: 'col-start-1 row-start-1' },
          { id: 'att-r', position: 'ATT', gridArea: 'col-start-3 row-start-1' },
        ]
      };
  }
};
