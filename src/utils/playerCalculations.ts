import { Player } from "@/types/player";

export type PerformanceStatus = "improving" | "needs-improvement" | "maintaining" | "neutral";

export const calculatePlayerPerformance = (player: Player): PerformanceStatus => {
  if (!player?.attributes || player.attributes.length === 0) return "neutral";

  const allAttributes = player.attributes;
  const sortedByDate = [...allAttributes].sort((a, b) => 
    new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
  );

  const recentValues = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2));
  const olderValues = sortedByDate.slice(Math.ceil(sortedByDate.length / 2));

  const recentAvg = recentValues.reduce((sum, attr) => sum + attr.value, 0) / recentValues.length;
  const olderAvg = olderValues.length > 0 
    ? olderValues.reduce((sum, attr) => sum + attr.value, 0) / olderValues.length 
    : recentAvg;

  const difference = recentAvg - olderAvg;
  if (difference > 0.5) return "improving";
  if (difference < -0.5) return "needs-improvement";
  return "maintaining";
};

export const getPerformanceColor = (status: PerformanceStatus): string => {
  switch (status) {
    case "improving":
      return "text-green-500";
    case "needs-improvement":
      return "text-amber-500";
    case "neutral":
      return "text-gray-500";
    default:
      return "text-blue-500";
  }
};

export const getPerformanceText = (status: PerformanceStatus): string => {
  switch (status) {
    case "improving":
      return "Improving";
    case "needs-improvement":
      return "Needs Improvement";
    case "neutral":
      return "No Data";
    default:
      return "Maintaining";
  }
};