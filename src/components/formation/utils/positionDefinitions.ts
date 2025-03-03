export const positionDefinitions: Record<string, { x: string; y: string; label: string }> = {
  // Goalkeeper - now at the bottom
  "GK": { x: "50%", y: "95%", label: "GK" },
  
  // Defenders - moved down (higher Y percentage)
  "DL": { x: "15%", y: "85%", label: "DL" },
  "DCL": { x: "35%", y: "85%", label: "DCL" },
  "DC": { x: "50%", y: "85%", label: "DC" },
  "DCR": { x: "65%", y: "85%", label: "DCR" },
  "DR": { x: "85%", y: "85%", label: "DR" },
  
  // Wing Backs
  "WBL": { x: "15%", y: "70%", label: "WBL" },
  "WBR": { x: "85%", y: "70%", label: "WBR" },
  
  // Defensive Midfielder
  "DM": { x: "50%", y: "70%", label: "DM" },
  
  // Midfielders
  "ML": { x: "15%", y: "55%", label: "ML" },
  "MCL": { x: "35%", y: "55%", label: "MCL" },
  "MC": { x: "50%", y: "55%", label: "MC" },
  "MCR": { x: "65%", y: "55%", label: "MCR" },
  "MR": { x: "85%", y: "55%", label: "MR" },
  
  // Attacking Midfielders
  "AML": { x: "25%", y: "40%", label: "AML" },
  "AMC": { x: "50%", y: "40%", label: "AMC" },
  "AMR": { x: "75%", y: "40%", label: "AMR" },
  
  // Strikers - now at the top
  "STL": { x: "30%", y: "20%", label: "STL" },
  "STC": { x: "50%", y: "20%", label: "STC" },
  "STR": { x: "70%", y: "20%", label: "STR" }
};

// Generate className for positioning based on x/y percentages
export const getPositionClass = (x: string, y: string): string => {
  return `left-[${x}] top-[${y}]`;
};
