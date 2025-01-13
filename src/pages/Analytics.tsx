import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttributeTrends } from "@/components/analytics/AttributeTrends";
import { ObjectiveStats } from "@/components/analytics/ObjectiveStats";
import { RadarChart } from "@/components/analytics/RadarChart";

export const Analytics = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attribute Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <AttributeTrends />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Objective Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ObjectiveStats />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Player Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};