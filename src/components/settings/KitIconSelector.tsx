
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { Shirt } from "lucide-react";

type KitIconType = "home_kit_icon" | "away_kit_icon" | "training_kit_icon";

interface KitIconSelectorProps {
  type: KitIconType;
  label: string;
  value: string;
  onChange: (type: KitIconType, value: string) => void;
  disabled?: boolean;
}

export function KitIconSelector({ type, label, value, onChange, disabled }: KitIconSelectorProps) {
  const [primaryColor, setPrimaryColor] = useState(value?.split("|")[0] || "#ffffff");
  const [secondaryColor, setSecondaryColor] = useState(value?.split("|")[1] || "#000000");
  
  // When either color changes, update the parent component
  const handleColorChange = (primary: string, secondary: string) => {
    const combinedValue = `${primary}|${secondary}`;
    onChange(type, combinedValue);
  };

  // Update primary color and notify parent
  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    handleColorChange(color, secondaryColor);
  };

  // Update secondary color and notify parent
  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    handleColorChange(primaryColor, color);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="w-24 h-24 flex items-center justify-center border border-gray-200 rounded-md overflow-hidden"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <Shirt 
              size={64}
              className="text-slate-800"
              fill={primaryColor}
              color={secondaryColor}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="space-y-1">
              <Label htmlFor={`${type}-primary`}>Primary</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                    disabled={disabled}
                  >
                    <span className="sr-only">Primary color</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker color={primaryColor} onChange={handlePrimaryColorChange} />
                  <Input
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="mt-2"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor={`${type}-secondary`}>Secondary</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    style={{ backgroundColor: secondaryColor }}
                    disabled={disabled}
                  >
                    <span className="sr-only">Secondary color</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker color={secondaryColor} onChange={handleSecondaryColorChange} />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="mt-2"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
