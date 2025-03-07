
import { PerformanceCategory } from "@/types/player";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * PerformanceCategorySelector props interface
 */
interface PerformanceCategorySelectorProps {
  /** Current performance category value */
  value: PerformanceCategory;
  /** Handler for when the value changes */
  onChange: (value: PerformanceCategory) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * PerformanceCategorySelector component
 * 
 * A dropdown selector for choosing performance categories (MESSI, RONALDO, JAGS)
 * used for player evaluation and formation settings
 */
export const PerformanceCategorySelector = ({ 
  value, 
  onChange,
  className 
}: PerformanceCategorySelectorProps) => {
  // Validate the value to ensure it's a valid PerformanceCategory
  const validValue = ["MESSI", "RONALDO", "JAGS"].includes(value) 
    ? value 
    : "MESSI";

  return (
    <Select 
      value={validValue} 
      onValueChange={(newValue: string) => onChange(newValue as PerformanceCategory)}
    >
      <SelectTrigger className={`w-[180px] ${className || ""}`}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="MESSI">Messi</SelectItem>
        <SelectItem value="RONALDO">Ronaldo</SelectItem>
        <SelectItem value="JAGS">Jags</SelectItem>
      </SelectContent>
    </Select>
  );
};
