import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface FixturesFilterProps {
  filterYear: string;
  filterMonth: string;
  filterDate: string;
  filterOpponent: string;
  filterCategory: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onOpponentChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export const FixturesFilter = ({
  filterYear,
  filterMonth,
  filterDate,
  filterOpponent,
  filterCategory,
  onYearChange,
  onMonthChange,
  onDateChange,
  onOpponentChange,
  onCategoryChange,
}: FixturesFilterProps) => {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: format(new Date(2024, i, 1), 'MMMM') };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Select value={filterYear} onValueChange={onYearChange}>
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterMonth} onValueChange={onMonthChange}>
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Months</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filterDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="h-10"
      />

      <Input
        placeholder="Search opponent..."
        value={filterOpponent}
        onChange={(e) => onOpponentChange(e.target.value)}
        className="h-10"
      />

      <Select value={filterCategory} onValueChange={onCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Ronaldo">Ronaldo</SelectItem>
          <SelectItem value="Messi">Messi</SelectItem>
          <SelectItem value="Jags">Jags</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};