export const positionDefinitions: Record<string, { x: string; y: string; label: string }> = {
  // Goalkeeper at bottom of the pitch (flipped from original to match display)
  "GK": { x: "50%", y: "90%", label: "GK" },
  
  // Defenders - spread out horizontally with more space
  "DL": { x: "15%", y: "75%", label: "DL" },
  "DCL": { x: "35%", y: "75%", label: "DCL" },
  "DC": { x: "50%", y: "75%", label: "DC" },
  "DCR": { x: "65%", y: "75%", label: "DCR" },
  "DR": { x: "85%", y: "75%", label: "DR" },
  
  // Wing Backs - moved further out to sides
  "WBL": { x: "10%", y: "65%", label: "WBL" },
  "WBR": { x: "90%", y: "65%", label: "WBR" },
  
  // Defensive Midfielder - moved slightly up
  "DM": { x: "50%", y: "58%", label: "DM" },
  
  // Midfielders - more spaced horizontally
  "ML": { x: "15%", y: "50%", label: "ML" },
  "MCL": { x: "35%", y: "48%", label: "MCL" },
  "MC": { x: "50%", y: "45%", label: "MC" },
  "MCR": { x: "65%", y: "48%", label: "MCR" },
  "MR": { x: "85%", y: "50%", label: "MR" },
  
  // Attacking Midfielders - adjusted spacing
  "AML": { x: "25%", y: "35%", label: "AML" },
  "AMC": { x: "50%", y: "32%", label: "AMC" },
  "AMR": { x: "75%", y: "35%", label: "AMR" },
  
  // Strikers - spread more horizontally
  "STL": { x: "30%", y: "15%", label: "STL" },
  "STC": { x: "50%", y: "15%", label: "STC" },
  "STR": { x: "70%", y: "15%", label: "STR" }
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
