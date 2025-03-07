
import { PerformanceCategory } from "@/types/player";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PerformanceCategorySelectorProps {
  value: PerformanceCategory;
  onChange: (value: PerformanceCategory) => void;
}

export const PerformanceCategorySelector = ({ value, onChange }: PerformanceCategorySelectorProps) => {
  return (
    <Select value={value} onValueChange={(newValue: string) => onChange(newValue as PerformanceCategory)}>
      <SelectTrigger className="w-[180px]">
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
