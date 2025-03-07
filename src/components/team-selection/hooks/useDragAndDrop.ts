
import { useState, useCallback } from "react";

export const useDragAndDrop = (initialEnabled: boolean = true) => {
  const [dragEnabled, setDragEnabled] = useState<boolean>(initialEnabled);

  const toggleDragEnabled = useCallback((enabled: boolean) => {
    console.log(`Toggling drag and drop: ${enabled}`);
    setDragEnabled(enabled);
  }, []);

  return {
    dragEnabled,
    toggleDragEnabled
  };
};
