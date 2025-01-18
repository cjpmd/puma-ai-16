import { Attribute } from "@/types/player";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";

interface AttributeSectionProps {
  category: string;
  attributes: Attribute[];
  attributeHistory: Record<string, { date: string; value: number; }[]>;
  onUpdateAttribute: (name: string, value: number) => void;
  playerCategory?: string;
  globalMultiplier?: number;
  playerId: string;
}

const getPerformanceColor = (currentValue: number, previousValue: number | undefined) => {
  if (previousValue === undefined) return "bg-blue-500";
  if (currentValue > previousValue) return "bg-green-500";
  if (currentValue < previousValue) return "bg-amber-500";
  return "bg-blue-500";
};

const getHeaderColor = (attributes: Attribute[], attributeHistory: Record<string, { date: string; value: number; }[]>) => {
  let improving = 0;
  let declining = 0;

  attributes.forEach(attr => {
    const history = attributeHistory[attr.name];
    if (history && history.length > 1) {
      const currentValue = history[history.length - 1].value;
      const previousValue = history[history.length - 2].value;
      if (currentValue > previousValue) improving++;
      if (currentValue < previousValue) declining++;
    }
  });

  if (improving > declining) return "text-green-500";
  if (declining > improving) return "text-amber-500";
  return "text-blue-500";
};

export const AttributeSection = ({
  category,
  attributes,
  attributeHistory,
  onUpdateAttribute,
  playerCategory,
  globalMultiplier = 1,
  playerId,
}: AttributeSectionProps) => {
  const { toast } = useToast();
  const [localValues, setLocalValues] = useState<Record<string, number>>({});

  // Query to fetch enabled attributes
  const { data: enabledAttributes } = useQuery({
    queryKey: ["attribute-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attribute_settings')
        .select('*')
        .eq('is_enabled', true)
        .eq('is_deleted', false);
      
      if (error) throw error;
      return data.map(attr => attr.name);
    },
  });

  // Filter attributes based on enabled settings
  const filteredAttributes = attributes.filter(attr => 
    enabledAttributes?.includes(attr.name)
  );

  const handleSliderChange = (name: string, value: number) => {
    setLocalValues(prev => ({ ...prev, [name]: value }));
    onUpdateAttribute(name, value);
  };

  const handleSliderCommit = async (name: string, value: number) => {
    try {
      const { error } = await supabase
        .from('player_attributes')
        .upsert({ 
          player_id: playerId,
          name,
          value,
          category: attributes.find(attr => attr.name === name)?.category
        }, {
          onConflict: 'player_id,name'
        });

      if (error) throw error;
      
      toast({
        title: "Attribute Updated",
        description: `${name} has been updated to ${value}`,
      });
    } catch (error) {
      console.error('Error updating attribute:', error);
      toast({
        title: "Error",
        description: "Failed to update attribute. Please try again.",
        variant: "destructive",
      });
    }
  };

  const headerColor = getHeaderColor(filteredAttributes, attributeHistory);

  // Don't render the section if there are no enabled attributes
  if (filteredAttributes.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={category}>
        <AccordionTrigger className={`text-lg font-semibold ${headerColor}`}>
          {category}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            {filteredAttributes.map((attr) => {
              const history = attributeHistory[attr.name] || [];
              const previousValue = history.length > 1 
                ? history[history.length - 2].value 
                : undefined;
              const performanceColor = getPerformanceColor(attr.value, previousValue);
              
              return (
                <div key={attr.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${performanceColor.replace('bg-', 'text-')}`}>
                      {attr.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {previousValue !== undefined && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">Previous: {previousValue}</span>
                          <div 
                            className={`w-3 h-3 rounded-full ${performanceColor}`}
                            title={`Previous score: ${previousValue}`}
                          />
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {(localValues[attr.name] ?? attr.value)}/20 {playerCategory === "RONALDO" && `(${((localValues[attr.name] ?? attr.value) * globalMultiplier).toFixed(1)} adjusted)`}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[localValues[attr.name] ?? attr.value]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => handleSliderChange(attr.name, value[0])}
                    onValueCommit={(value) => handleSliderCommit(attr.name, value[0])}
                    className={`${performanceColor} transition-colors`}
                  />
                  {history.length > 0 && (
                    <div className="h-32 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={history.map((h) => ({
                            date: format(new Date(h.date), "MMM d"),
                            value: h.value,
                            adjustedValue: playerCategory === "RONALDO" ? h.value * globalMultiplier : h.value,
                          }))}
                          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                        >
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 20]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#4ADE80"
                            strokeWidth={2}
                            dot={false}
                          />
                          {playerCategory === "RONALDO" && (
                            <Line
                              type="monotone"
                              dataKey="adjustedValue"
                              stroke="#F87171"
                              strokeWidth={2}
                              dot={false}
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};