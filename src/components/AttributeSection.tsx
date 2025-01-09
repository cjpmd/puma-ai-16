import { Attribute } from "@/types/player";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AttributeSectionProps {
  category: string;
  attributes: Attribute[];
  attributeHistory: Record<string, { date: string; value: number; }[]>;
  onUpdateAttribute: (name: string, value: number) => void;
  playerCategory?: string;
  globalMultiplier?: number;
  playerId: string; // Add playerId prop
}

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

  const handleUpdateAttribute = async (name: string, value: number) => {
    try {
      const { error } = await supabase
        .from('player_attributes')
        .update({ value })
        .eq('player_id', playerId)
        .eq('name', name);

      if (error) throw error;

      onUpdateAttribute(name, value);
      
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

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{category}</h3>
      <div className="space-y-6">
        {attributes.map((attr) => (
          <div key={attr.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{attr.name}</span>
              <span className="text-sm text-muted-foreground">
                {attr.value}/20 {playerCategory === "RONALDO" && `(${(attr.value * globalMultiplier).toFixed(1)} adjusted)`}
              </span>
            </div>
            <Slider
              value={[attr.value]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => handleUpdateAttribute(attr.name, value[0])}
            />
            {attributeHistory[attr.name]?.length > 1 && (
              <div className="h-32 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={attributeHistory[attr.name].map((h) => ({
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
        ))}
      </div>
    </div>
  );
};