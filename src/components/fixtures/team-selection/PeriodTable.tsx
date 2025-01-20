import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MinusCircle } from "lucide-react";

interface Position {
  abbreviation: string;
  full_name: string;
}

interface Player {
  id: string;
  name: string;
  squad_number: number;
}

interface Period {
  id: string;
  start_minute: number;
  duration_minutes: number;
}

interface PeriodTableProps {
  periods: Period[];
  positions: Position[];
  players: Player[];
  format: string;
  onPositionChange: (periodIndex: number, positionIndex: number, value: string) => void;
  onPlayerChange: (periodIndex: number, positionIndex: number, value: string) => void;
  onSubstituteChange: (periodIndex: number, subIndex: number, value: string) => void;
  onDurationChange: (periodIndex: number, value: number) => void;
  onRemovePeriod: (index: number) => void;
}

export const PeriodTable = ({
  periods,
  positions,
  players,
  format,
  onPositionChange,
  onPlayerChange,
  onSubstituteChange,
  onDurationChange,
  onRemovePeriod,
}: PeriodTableProps) => {
  const getPositionsCount = (format: string) => {
    switch (format) {
      case "4-a-side": return 4;
      case "5-a-side": return 5;
      case "7-a-side": return 7;
      case "9-a-side": return 9;
      case "11-a-side": return 11;
      default: return 7;
    }
  };

  return (
    <Table className="border-collapse w-full">
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Position</TableHead>
          {periods.map((_, index) => (
            <TableHead key={index} className="min-w-[160px]">
              <div className="flex items-center justify-between">
                <span>Period {index + 1}</span>
                {periods.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePeriod(index)}
                    className="h-6 w-6 p-0"
                  >
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Starting players */}
        {Array.from({ length: getPositionsCount(format) }, (_, positionIndex) => (
          <TableRow key={positionIndex}>
            <TableCell className="font-medium">{positionIndex + 1}</TableCell>
            {periods.map((period, periodIndex) => (
              <TableCell key={periodIndex} className="p-1">
                <div className="space-y-1">
                  <Select
                    value={period.positions[positionIndex].position}
                    onValueChange={(value) => onPositionChange(periodIndex, positionIndex, value)}
                  >
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions?.map((pos) => (
                        <SelectItem key={pos.abbreviation} value={pos.abbreviation}>
                          {pos.full_name} [{pos.abbreviation}]
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={period.positions[positionIndex].playerId}
                    onValueChange={(value) => onPlayerChange(periodIndex, positionIndex, value)}
                  >
                    <SelectTrigger className="h-7">
                      <SelectValue placeholder="Player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} (#{player.squad_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
        
        {/* Substitutes section */}
        <TableRow>
          <TableCell colSpan={periods.length + 1} className="bg-muted/50 font-medium">
            Substitutes
          </TableCell>
        </TableRow>
        {Array.from({ length: Math.ceil(getPositionsCount(format) / 2) }, (_, subIndex) => (
          <TableRow key={`sub-${subIndex}`}>
            <TableCell className="font-medium">SUB {subIndex + 1}</TableCell>
            {periods.map((period, periodIndex) => (
              <TableCell key={periodIndex} className="p-1">
                <Select
                  value={period.substitutes[subIndex].playerId}
                  onValueChange={(value) => onSubstituteChange(periodIndex, subIndex, value)}
                >
                  <SelectTrigger className="h-7">
                    <SelectValue placeholder="Select substitute" />
                  </SelectTrigger>
                  <SelectContent>
                    {players?.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} (#{player.squad_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            ))}
          </TableRow>
        ))}

        {/* Duration row */}
        <TableRow>
          <TableCell>Duration</TableCell>
          {periods.map((period, index) => (
            <TableCell key={index} className="p-1">
              <Input
                type="number"
                value={period.duration_minutes}
                onChange={(e) => onDurationChange(index, parseInt(e.target.value))}
                className="h-7 w-16"
              />
            </TableCell>
          ))}
        </TableRow>
      </TableBody>
    </Table>
  );
};
