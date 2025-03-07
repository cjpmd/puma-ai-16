
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PeriodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPeriod: () => void;
  newPeriodName: string;
  setNewPeriodName: (name: string) => void;
  newPeriodDuration: number;
  setNewPeriodDuration: (duration: number) => void;
  newPeriodHalf: string;
  setNewPeriodHalf: (half: string) => void;
}

export const PeriodDialog = ({
  isOpen,
  onOpenChange,
  onAddPeriod,
  newPeriodName,
  setNewPeriodName,
  newPeriodDuration,
  setNewPeriodDuration,
  newPeriodHalf,
  setNewPeriodHalf,
}: PeriodDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Period</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="period-half">Half</Label>
            <Select value={newPeriodHalf} onValueChange={setNewPeriodHalf}>
              <SelectTrigger>
                <SelectValue placeholder="Select half" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Half</SelectItem>
                <SelectItem value="2">Second Half</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period-name">Period Name</Label>
            <Input
              id="period-name"
              value={newPeriodName}
              onChange={(e) => setNewPeriodName(e.target.value)}
              placeholder="e.g., Opening 15 min"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period-duration">Duration (minutes)</Label>
            <Input
              id="period-duration"
              type="number"
              min="1"
              max="90"
              value={newPeriodDuration}
              onChange={(e) => setNewPeriodDuration(parseInt(e.target.value) || 15)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAddPeriod}>
            Add Period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
