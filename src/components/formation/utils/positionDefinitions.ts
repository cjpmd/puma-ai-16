export const positionDefinitions: Record<string, { x: string; y: string; label: string }> = {
  // Goalkeeper at bottom of the pitch
  "GK": { x: "50%", y: "85%", label: "GK" },
  
  // Defenders - slightly above the goalkeeper
  "DL": { x: "20%", y: "70%", label: "DL" },
  "DCL": { x: "35%", y: "70%", label: "DCL" },
  "DC": { x: "50%", y: "70%", label: "DC" },
  "DCR": { x: "65%", y: "70%", label: "DCR" },
  "DR": { x: "80%", y: "70%", label: "DR" },
  
  // Wing Backs
  "WBL": { x: "15%", y: "60%", label: "WBL" },
  "WBR": { x: "85%", y: "60%", label: "WBR" },
  
  // Defensive Midfielder
  "DM": { x: "50%", y: "55%", label: "DM" },
  
  // Midfielders
  "ML": { x: "20%", y: "45%", label: "ML" },
  "MCL": { x: "35%", y: "45%", label: "MCL" },
  "MC": { x: "50%", y: "45%", label: "MC" },
  "MCR": { x: "65%", y: "45%", label: "MCR" },
  "MR": { x: "80%", y: "45%", label: "MR" },
  
  // Attacking Midfielders
  "AML": { x: "30%", y: "30%", label: "AML" },
  "AMC": { x: "50%", y: "30%", label: "AMC" },
  "AMR": { x: "70%", y: "30%", label: "AMR" },
  
  // Strikers - at the top of the pitch
  "STL": { x: "35%", y: "15%", label: "STL" },
  "STC": { x: "50%", y: "15%", label: "STC" },
  "STR": { x: "65%", y: "15%", label: "STR" }
};

// Generate className for positioning based on x/y percentages
export const getPositionClass = (x: string, y: string): string => {
  return `left-[${x}] top-[${y}]`;
};
