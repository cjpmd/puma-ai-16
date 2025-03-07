
import { DraggableFormation } from './DraggableFormation';

export { DraggableFormation };

// Also export the Props interface for TypeScript type checking
export type { DraggableFormationProps } from './DraggableFormation';

// Export hooks
export { useDraggableFormation } from './hooks/useDraggableFormation';
export { usePeriodManagement } from './hooks/usePeriodManagement';
export { useSquadModeToggle } from './hooks/useSquadModeToggle';

// Export other useful utilities
export * from './utils/formationLayoutUtils';
