
// Helper function to get positions for a specific line (e.g., defense, midfield)
export const getPositionsInLine = (line: 'defense' | 'midfield' | 'attack'): string[] => {
  switch (line) {
    case 'defense':
      return ["DL", "DCL", "DC", "DCR", "DR", "WBL", "WBR"];
    case 'midfield':
      return ["DM", "ML", "MCL", "MC", "MCR", "MR", "AML", "AMC", "AMR"];
    case 'attack':
      return ["STL", "STC", "STR"];
    default:
      return [];
  }
};
