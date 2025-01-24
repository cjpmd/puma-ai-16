import { Attribute } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { format, parseISO } from "date-fns";

export interface AttributesSectionProps {
  activeCategories: string[];
  filteredAttributes: Attribute[];
  attributeHistory: Record<string, { date: string; value: number; }[]>;
  onUpdateAttribute: (name: string, value: number) => void;
  playerId: string;
  calculateCategoryAverage: (category: string) => string;
  getRadarData: (category: string) => { name: string; value: number }[];
}

export const AttributesSection = ({
  activeCategories,
  filteredAttributes,
  attributeHistory,
  onUpdateAttribute,
  calculateCategoryAverage,
  getRadarData,
}: AttributesSectionProps) => {
  return (
    <Tabs defaultValue={activeCategories[0]} className="w-full">
      <TabsList className="w-full justify-start">
        {activeCategories.map((category) => (
          <TabsTrigger key={category} value={category} className="flex-1">
            <div className="flex flex-col items-center">
              <span>{category}</span>
              <span className="text-sm text-muted-foreground">
                {calculateCategoryAverage(category)}
              </span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
      {activeCategories.map((category) => (
        <TabsContent key={category} value={category} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData(category)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <Radar
                      name="Attributes"
                      dataKey="value"
                      stroke="#2563eb"
                      fill="#2563eb"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {filteredAttributes
                      .filter((attr) => attr.category === category)
                      .map((attribute) => {
                        const history = attributeHistory[attribute.name] || [];
                        return (
                          <div key={attribute.name} className="space-y-2">
                            <div className="flex justify-between">
                              <Label>{attribute.name}</Label>
                              <span className="text-sm text-muted-foreground">
                                {attribute.value}
                              </span>
                            </div>
                            <Slider
                              value={[attribute.value]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) =>
                                onUpdateAttribute(attribute.name, value[0])
                              }
                            />
                            {history.length > 0 && (
                              <div className="h-[100px]">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={history}>
                                    <XAxis
                                      dataKey="date"
                                      tickFormatter={(date) =>
                                        format(parseISO(date), "MMM d")
                                      }
                                    />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                      labelFormatter={(date) =>
                                        format(parseISO(date as string), "MMMM d, yyyy")
                                      }
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="value"
                                      stroke="#2563eb"
                                      dot={false}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};