import { Card, CardContent } from "../ui/card";
import { AttributeSection } from "../AttributeSection";
import { RadarChart } from "../analytics/RadarChart";
import { Attribute } from "@/types/player";

interface AttributesSectionProps {
  activeCategories: string[];
  filteredAttributes: Attribute[];
  attributeHistory: Record<string, { date: string; value: number; }[]>;
  onUpdateAttribute: (name: string, value: number) => void;
  playerId: string;
  playerCategory: string;
  calculateCategoryAverage: (category: string) => string;
  getRadarData: (category: string) => { name: string; value: number; fullMark: number; }[];
}

export const AttributesSection = ({
  activeCategories,
  filteredAttributes,
  attributeHistory,
  onUpdateAttribute,
  playerId,
  playerCategory,
  calculateCategoryAverage,
  getRadarData
}: AttributesSectionProps) => {
  return (
    <>
      <Card>
        <CardContent>
          <div className="space-y-8">
            {activeCategories.map((category) => {
              const categoryAttributes = filteredAttributes.filter(
                (attr) => attr.category === category
              );
              
              if (categoryAttributes.length > 0) {
                return (
                  <AttributeSection
                    key={category}
                    category={`${category} (${calculateCategoryAverage(category)})`}
                    attributes={categoryAttributes}
                    attributeHistory={attributeHistory}
                    onUpdateAttribute={onUpdateAttribute}
                    playerId={playerId}
                    playerCategory={playerCategory}
                  />
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {activeCategories.map((category) => {
          const radarData = getRadarData(category);
          if (radarData.length > 0) {
            return (
              <Card key={category}>
                <CardContent className="pt-6">
                  <RadarChart data={radarData} title={category} />
                </CardContent>
              </Card>
            );
          }
          return null;
        })}
      </div>
    </>
  );
};