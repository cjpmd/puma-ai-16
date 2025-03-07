
import { useState, useCallback } from "react";

interface UsePeriodManagementProps {
  initialPeriodNumber?: number;
  initialPeriodDuration?: number;
  onPeriodChange?: (periodNumber: number) => void;
  onDurationChange?: (duration: number) => void;
  periodId?: number;
}

export const usePeriodManagement = ({
  initialPeriodNumber = 1,
  initialPeriodDuration = 45,
  onPeriodChange,
  onDurationChange,
  periodId
}: UsePeriodManagementProps) => {
  const [localPeriod, setLocalPeriod] = useState<number>(initialPeriodNumber);
  const [localDuration, setLocalDuration] = useState<number>(initialPeriodDuration);
  
  // Handle period change
  const handlePeriodChange = useCallback((periodNumber: number) => {
    setLocalPeriod(periodNumber);
    if (onPeriodChange) {
      onPeriodChange(periodNumber);
    }
  }, [onPeriodChange]);
  
  // Handle duration change
  const handleDurationChange = useCallback((duration: number) => {
    if (duration > 0 && duration <= 90) {
      setLocalDuration(duration);
      if (onDurationChange) {
        onDurationChange(duration);
      }
    }
  }, [onDurationChange]);
  
  // Get period display name based on period number or custom ID
  const getPeriodDisplayName = useCallback(() => {
    if (periodId) {
      const halfNumber = Math.floor(periodId / 100);
      return halfNumber === 1 ? "First Half" : "Second Half";
    }
    return `Period ${localPeriod}`;
  }, [periodId, localPeriod]);
  
  return {
    localPeriod,
    localDuration,
    handlePeriodChange,
    handleDurationChange,
    getPeriodDisplayName
  };
};
