
import { useState, useEffect } from "react";
import { KitIcon } from "@/components/fixtures/KitIcon";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface KitIconSelectorProps {
  type: 'home_kit_icon' | 'away_kit_icon' | 'training_kit_icon';
  label: string;
  value: string;
  onChange: (type: 'home_kit_icon' | 'away_kit_icon' | 'training_kit_icon', value: string) => void;
  disabled?: boolean;
}

export function KitIconSelector({
  type,
  label,
  value,
  onChange,
  disabled = false
}: KitIconSelectorProps) {
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [pattern, setPattern] = useState("solid");
  
  // Parse initial value if provided
  useEffect(() => {
    if (value) {
      const parts = value.split('|');
      if (parts.length >= 2) {
        setPrimaryColor(parts[0]);
        setSecondaryColor(parts[1]);
        if (parts.length >= 3) {
          setPattern(parts[2]);
        }
      }
    }
  }, [value]);
  
  // Update the output value when any input changes
  useEffect(() => {
    const newValue = `${primaryColor}|${secondaryColor}|${pattern}`;
    if (newValue !== value) {
      onChange(type, newValue);
    }
  }, [primaryColor, secondaryColor, pattern, type]);
  
  const patterns = [
    { value: "solid", label: "Solid" },
    { value: "stripes", label: "Vertical Stripes" },
    { value: "hoops", label: "Horizontal Stripes" },
    { value: "quarters", label: "Quarters" },
    { value: "halves", label: "Halves" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col">
        <Label className="mb-2">{label}</Label>
        <div className="flex items-center gap-2 mb-3">
          <KitIcon value={`${primaryColor}|${secondaryColor}|${pattern}`} size="medium" />
          <span className="text-sm text-muted-foreground">Kit Preview</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Pattern</Label>
          <Select
            value={pattern}
            onValueChange={setPattern}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select pattern" />
            </SelectTrigger>
            <SelectContent>
              {patterns.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs">Primary Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <Popover>
              <PopoverTrigger disabled={disabled}>
                <div 
                  className="h-8 w-8 rounded-md border"
                  style={{ backgroundColor: primaryColor }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker color={primaryColor} onChange={setPrimaryColor} />
                <div className="mt-2 flex items-center">
                  <span className="text-xs mr-2">#</span>
                  <HexColorInput
                    color={primaryColor}
                    onChange={setPrimaryColor}
                    className="w-full text-sm p-1 border rounded"
                    prefixed={false}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <HexColorInput
              color={primaryColor}
              onChange={setPrimaryColor}
              className="flex-1 text-sm p-2 border rounded"
              prefixed={true}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs">Secondary Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <Popover>
              <PopoverTrigger disabled={disabled}>
                <div 
                  className="h-8 w-8 rounded-md border"
                  style={{ backgroundColor: secondaryColor }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker color={secondaryColor} onChange={setSecondaryColor} />
                <div className="mt-2 flex items-center">
                  <span className="text-xs mr-2">#</span>
                  <HexColorInput
                    color={secondaryColor}
                    onChange={setSecondaryColor}
                    className="w-full text-sm p-1 border rounded"
                    prefixed={false}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <HexColorInput
              color={secondaryColor}
              onChange={setSecondaryColor}
              className="flex-1 text-sm p-2 border rounded"
              prefixed={true}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
