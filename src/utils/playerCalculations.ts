import { Player } from "@/types/player";

export type PerformanceStatus = "improving" | "needs-improvement" | "maintaining" | "neutral";

export const calculatePlayerPerformance = (player?: Player): PerformanceStatus => {
  if (!player?.attributes || player.attributes.length === 0) return "neutral";

  const allAttributes = player.attributes;
  const sortedByDate = [...allAttributes].sort((a, b) => {
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bDate - aDate;
  });

  // Get the most recent attribute values
  const recentValues = sortedByDate.slice(0, Math.min(5, sortedByDate.length));
  const averageRecent = recentValues.reduce((sum, attr) => sum + attr.value, 0) / recentValues.length;

  // Get the older attribute values
  const olderValues = sortedByDate.slice(Math.min(5, sortedByDate.length));
  if (olderValues.length === 0) return "neutral";

  const averageOlder = olderValues.reduce((sum, attr) => sum + attr.value, 0) / olderValues.length;

  // Calculate the percentage change
  const percentageChange = ((averageRecent - averageOlder) / averageOlder) * 100;

  if (percentageChange > 5) return "improving";
  if (percentageChange < -5) return "needs-improvement";
  return "maintaining";
};

export const getPerformanceColor = (status: PerformanceStatus): string => {
  switch (status) {
    case "improving":
      return "text-green-600";
    case "needs-improvement":
      return "text-red-600";
    case "maintaining":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

export const getPerformanceText = (status: PerformanceStatus): string => {
  switch (status) {
    case "improving":
      return "Improving";
    case "needs-improvement":
      return "Needs Improvement";
    case "maintaining":
      return "Maintaining";
    default:
      return "Neutral";
  }
};
