
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type KitIconType = "home_kit_icon" | "away_kit_icon" | "training_kit_icon";
type PatternType = "solid" | "stripes" | "hoops";

interface KitIconSelectorProps {
  type: KitIconType;
  label: string;
  value: string;
  onChange: (type: KitIconType, value: string) => void;
  disabled?: boolean;
}

export function KitIconSelector({ type, label, value, onChange, disabled }: KitIconSelectorProps) {
  // Parse the existing value to extract colors and pattern
  const valueParts = value?.split("|") || [];
  
  const [primaryColor, setPrimaryColor] = useState(valueParts[0] || "#ffffff");
  const [secondaryColor, setSecondaryColor] = useState(valueParts[1] || "#000000");
  const [pattern, setPattern] = useState<PatternType>(
    (valueParts[2] as PatternType) || "solid"
  );
  
  // When any value changes, update the parent component
  const handleChange = (primary: string, secondary: string, newPattern: PatternType) => {
    const combinedValue = `${primary}|${secondary}|${newPattern}`;
    onChange(type, combinedValue);
  };

  // Update primary color and notify parent
  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    handleChange(color, secondaryColor, pattern);
  };

  // Update secondary color and notify parent
  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    handleChange(primaryColor, color, pattern);
  };

  // Update pattern and notify parent
  const handlePatternChange = (newPattern: PatternType) => {
    setPattern(newPattern);
    handleChange(primaryColor, secondaryColor, newPattern);
  };

  // Create SVG patterns for the preview
  const getShirtStyle = () => {
    switch (pattern) {
      case "stripes":
        return {
          fill: `url(#stripes-${type})`,
          color: secondaryColor,
        };
      case "hoops":
        return {
          fill: `url(#hoops-${type})`,
          color: secondaryColor,
        };
      default:
        return {
          fill: primaryColor,
          color: secondaryColor,
        };
    }
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
            <div className="relative">
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  {/* Vertical stripes pattern */}
                  <pattern
                    id={`stripes-${type}`}
                    patternUnits="userSpaceOnUse"
                    width="10"
                    height="10"
                    patternTransform="rotate(90)"
                  >
                    <rect width="5" height="10" fill={primaryColor} />
                    <rect x="5" width="5" height="10" fill={secondaryColor} />
                  </pattern>
                  
                  {/* Horizontal hoops pattern */}
                  <pattern
                    id={`hoops-${type}`}
                    patternUnits="userSpaceOnUse"
                    width="10"
                    height="10"
                  >
                    <rect width="10" height="5" fill={primaryColor} />
                    <rect y="5" width="10" height="5" fill={secondaryColor} />
                  </pattern>
                </defs>
              </svg>
              <Shirt 
                size={64}
                className="text-slate-800"
                {...getShirtStyle()}
              />
            </div>
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
          
          <div className="w-full pt-2">
            <Label className="mb-2 block">Pattern</Label>
            <RadioGroup 
              value={pattern} 
              onValueChange={(value) => handlePatternChange(value as PatternType)}
              className="flex space-x-2"
              disabled={disabled}
            >
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1">
                <RadioGroupItem value="solid" id={`${type}-solid`} />
                <Label htmlFor={`${type}-solid`}>Solid</Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1">
                <RadioGroupItem value="stripes" id={`${type}-stripes`} />
                <Label htmlFor={`${type}-stripes`}>Stripes</Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-2 flex-1">
                <RadioGroupItem value="hoops" id={`${type}-hoops`} />
                <Label htmlFor={`${type}-hoops`}>Hoops</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
