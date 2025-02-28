
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FixtureFormData } from "./schemas/fixtureFormSchema";

interface TeamCardProps {
  index: number;
  form: UseFormReturn<FixtureFormData>;
  players?: any[];
  getScoreLabel: (isHomeScore: boolean, teamIndex: number) => string;
  getMotmLabel: (teamIndex: number) => string;
}

export const TeamCard = ({ 
  index, 
  form, 
  players = [],
  getScoreLabel,
  getMotmLabel
}: TeamCardProps) => {
  const performanceCategory = form.watch(`team_times.${index}.performance_category`) || "MESSI";
  
  // Get the current MOTM player ID for this team
  const motmPlayerId = form.watch(`motm_player_ids.${index}`);
  
  // For debugging
  useEffect(() => {
    console.log(`Team ${index + 1} MOTM Player ID:`, motmPlayerId);
    console.log(`Team ${index + 1} MOTM player array:`, form.getValues().motm_player_ids);
  }, [index, motmPlayerId, form]);

  // Ensure motm_player_ids array is properly initialized for this index
  useEffect(() => {
    // Get current MOTM player IDs array
    const currentMotmIds = [...(form.getValues().motm_player_ids || [])];
    
    // Make sure the array is long enough to hold the current team's MOTM
    if (currentMotmIds.length <= index || currentMotmIds[index] === undefined) {
      // Ensure array has enough elements
      while (currentMotmIds.length <= index) {
        currentMotmIds.push("");
      }
      
      // Update the form value with the padded array
      form.setValue('motm_player_ids', currentMotmIds, { shouldDirty: false });
      console.log(`Initialized motm_player_ids array for team ${index + 1}:`, currentMotmIds);
    }
  }, [form, index]);

  // Find selected player name for display
  const selectedPlayer = players.find(p => p.id === motmPlayerId);
  const selectedPlayerName = selectedPlayer ? selectedPlayer.name : "None";
  
  // Handle change of Player of the Match
  const handleMotmChange = (value: string) => {
    const newValue = value === "none" ? "" : value;
    console.log(`Setting MOTM for team ${index + 1} to:`, newValue);
    
    // Get current array of MOTM player IDs
    const currentMotmIds = [...(form.getValues().motm_player_ids || [])];
    
    // Ensure the array is long enough
    while (currentMotmIds.length <= index) {
      currentMotmIds.push("");
    }
    
    // Update the value at the specific index
    currentMotmIds[index] = newValue;
    
    // Set the entire array back to the form
    form.setValue('motm_player_ids', currentMotmIds, { shouldDirty: true });
    
    // Log the updated array
    console.log(`Updated motm_player_ids array after selection:`, currentMotmIds);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-2">Team {index + 1} ({performanceCategory})</h3>
        
        <div className="space-y-4">
          {/* Performance Category */}
          <div className="space-y-2">
            <Label htmlFor={`team_times.${index}.performance_category`}>Performance Category</Label>
            <Select
              value={performanceCategory}
              onValueChange={(value) => {
                form.setValue(`team_times.${index}.performance_category`, value);
              }}
            >
              <SelectTrigger id={`team_times.${index}.performance_category`}>
                <SelectValue placeholder="Select performance category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MESSI">MESSI</SelectItem>
                <SelectItem value="RONALDO">RONALDO</SelectItem>
                <SelectItem value="NEYMAR">NEYMAR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          {/* Time Inputs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`team_times.${index}.meeting_time`}>Meeting Time</Label>
              <Input
                id={`team_times.${index}.meeting_time`}
                type="time"
                value={form.watch(`team_times.${index}.meeting_time`) || ""}
                onChange={(e) => {
                  form.setValue(`team_times.${index}.meeting_time`, e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`team_times.${index}.start_time`}>Kick Off</Label>
              <Input
                id={`team_times.${index}.start_time`}
                type="time"
                value={form.watch(`team_times.${index}.start_time`) || ""}
                onChange={(e) => {
                  form.setValue(`team_times.${index}.start_time`, e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`team_times.${index}.end_time`}>End Time</Label>
              <Input
                id={`team_times.${index}.end_time`}
                type="time"
                value={form.watch(`team_times.${index}.end_time`) || ""}
                onChange={(e) => {
                  form.setValue(`team_times.${index}.end_time`, e.target.value);
                }}
              />
            </div>
          </div>
          
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`team_${index + 1}_score` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getScoreLabel(true, index)}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`opponent_${index + 1}_score` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getScoreLabel(false, index)}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Player of the Match */}
          <div className="space-y-2">
            <Label htmlFor={`motm_player_ids.${index}`}>{getMotmLabel(index)}</Label>
            <Select
              value={motmPlayerId || "none"}
              onValueChange={handleMotmChange}
            >
              <SelectTrigger id={`motm_player_ids.${index}`}>
                <SelectValue placeholder="Select player">
                  {selectedPlayerName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.squad_number ? `(${player.squad_number})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
