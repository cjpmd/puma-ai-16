export const positionDefinitions: Record<string, { x: string; y: string; label: string }> = {
  // Goalkeeper at bottom of the pitch (flipped from original to match display)
  "GK": { x: "50%", y: "95%", label: "GK" },
  
  // Defenders
  "DL": { x: "20%", y: "80%", label: "DL" },
  "DCL": { x: "35%", y: "80%", label: "DCL" },
  "DC": { x: "50%", y: "80%", label: "DC" },
  "DCR": { x: "65%", y: "80%", label: "DCR" },
  "DR": { x: "80%", y: "80%", label: "DR" },
  
  // Wing Backs
  "WBL": { x: "15%", y: "70%", label: "WBL" },
  "WBR": { x: "85%", y: "70%", label: "WBR" },
  
  // Defensive Midfielder
  "DM": { x: "50%", y: "65%", label: "DM" },
  
  // Midfielders
  "ML": { x: "20%", y: "55%", label: "ML" },
  "MCL": { x: "35%", y: "55%", label: "MCL" },
  "MC": { x: "50%", y: "55%", label: "MC" },
  "MCR": { x: "65%", y: "55%", label: "MCR" },
  "MR": { x: "80%", y: "55%", label: "MR" },
  
  // Attacking Midfielders
  "AML": { x: "30%", y: "40%", label: "AML" },
  "AMC": { x: "50%", y: "40%", label: "AMC" },
  "AMR": { x: "70%", y: "40%", label: "AMR" },
  
  // Strikers - at the top of the pitch
  "STL": { x: "35%", y: "20%", label: "STL" },
  "STC": { x: "50%", y: "20%", label: "STC" },
  "STR": { x: "65%", y: "20%", label: "STR" }
};

// Generate className for positioning based on x/y percentages
export const getPositionClass = (x: string, y: string): string => {
  return `left-[${x}] top-[${y}]`;
};

// Create helper to ensure positions are correctly aligned on the pitch
export const getPositionStyle = (position: string): React.CSSProperties => {
  const positionData = positionDefinitions[position];
  if (!positionData) return {};
  
  return {
    left: positionData.x,
    top: positionData.y,
    transform: 'translate(-50%, -50%)',
    position: 'absolute'
  };
};
