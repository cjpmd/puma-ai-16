import { AttributeTrends } from "@/components/analytics/AttributeTrends";
import { ObjectiveStats } from "@/components/analytics/ObjectiveStats";

export const Analytics = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <ObjectiveStats />
        <AttributeTrends />
      </div>
    </div>
  );
};