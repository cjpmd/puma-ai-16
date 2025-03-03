
import { useDraggableFormation } from "./draggable/hooks/useDraggableFormation";
import { FormationPositionSlot } from "./draggable/FormationPositionSlot";
import { FormationHelperText } from "./draggable/FormationHelperText";
import { DraggableFormation as FormationComponent } from "./draggable/DraggableFormation";

// Export both the component and its utilities
export const DraggableFormation = FormationComponent;

// Also export the utilities for more advanced usage
export const DraggableFormationUtils = {
  useFormation: useDraggableFormation,
  PositionSlot: FormationPositionSlot,
  HelperText: FormationHelperText
};
