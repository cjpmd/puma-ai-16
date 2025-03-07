
import { useState, useEffect } from "react";

interface UsePeriodManagementProps {
  initialPeriodNumber?: number;
  initialPeriodDuration?: number;
  onPeriodChange?: (period: number) => void;
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
  const [localPeriod, setLocalPeriod] = useState(initialPeriodNumber);
  const [localDuration, setLocalDuration] = useState(initialPeriodDuration);

  // Sync with external props
  useEffect(() => {
    setLocalPeriod(initialPeriodNumber);
  }, [initialPeriodNumber]);

  useEffect(() => {
    setLocalDuration(initialPeriodDuration);
  }, [initialPeriodDuration]);

  const handlePeriodChange = (period: number) => {
    setLocalPeriod(period);
    if (onPeriodChange) {
      onPeriodChange(period);
    }
  };

  const handleDurationChange = (duration: number) => {
    setLocalDuration(duration);
    if (onDurationChange) {
      onDurationChange(duration);
    }
  };

  const getPeriodDisplayName = () => {
    if (periodId) {
      if (periodId === 100) return "First Half";
      if (periodId === 200) return "Second Half";
      return `Period ${periodId}`;
    }
    return localPeriod === 1 ? "First Half" : "Second Half";
  };

  return {
    localPeriod,
    localDuration,
    handlePeriodChange,
    handleDurationChange,
    getPeriodDisplayName
  };
};
