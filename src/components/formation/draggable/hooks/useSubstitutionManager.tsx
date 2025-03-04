
import { useState, useCallback, useEffect } from 'react';

export const useSubstitutionManager = (initialSelections = {}, onSelectionChange) => {
  const [substitutions, setSubstitutions] = useState({});
  
  // Initialize from selections
  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      const initialSubstitutions = Object.entries(initialSelections)
        .filter(([slotId, selection]) => slotId.startsWith('sub-') || selection.isSubstitution)
        .reduce((subs, [slotId, selection]) => {
          subs[slotId] = selection;
          return subs;
        }, {});
      
      setSubstitutions(initialSubstitutions);
    }
  }, [initialSelections]);
  
  // Add a substitution
  const addSubstitution = useCallback((playerId, position = null) => {
    // Find next available substitute slot
    let subSlotIndex = 0;
    while (Object.keys(substitutions).includes(`sub-${subSlotIndex}`)) {
      subSlotIndex++;
    }
    
    const slotId = `sub-${subSlotIndex}`;
    const newSubstitutions = {
      ...substitutions,
      [slotId]: {
        playerId,
        position: position || `sub-${subSlotIndex}`,
        isSubstitution: true
      }
    };
    
    setSubstitutions(newSubstitutions);
    
    // Update all selections with the new substitution
    if (onSelectionChange) {
      const newSelections = {
        ...initialSelections,
        [slotId]: newSubstitutions[slotId]
      };
      
      onSelectionChange(newSelections);
    }
    
    return slotId;
  }, [substitutions, initialSelections, onSelectionChange]);
  
  // Remove a substitution
  const removeSubstitution = useCallback((slotId) => {
    if (!slotId.startsWith('sub-') && !substitutions[slotId]?.isSubstitution) {
      return false;
    }
    
    const newSubstitutions = { ...substitutions };
    delete newSubstitutions[slotId];
    
    setSubstitutions(newSubstitutions);
    
    // Update all selections by removing this substitution
    if (onSelectionChange) {
      const newSelections = { ...initialSelections };
      delete newSelections[slotId];
      
      onSelectionChange(newSelections);
    }
    
    return true;
  }, [substitutions, initialSelections, onSelectionChange]);
  
  // Get all substitutions
  const getSubstitutions = useCallback(() => {
    return substitutions;
  }, [substitutions]);
  
  return {
    substitutions,
    addSubstitution,
    removeSubstitution,
    getSubstitutions
  };
};
