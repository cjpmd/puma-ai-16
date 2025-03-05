import { AllSelections } from "../types";

export function extractSelectedPlayers(selections: AllSelections): Set<string> {
  const selectedPlayers = new Set<string>();
  
  // Iterate through all periods, teams, and slots
  Object.values(selections).forEach(periodSelections => {
    Object.values(periodSelections).forEach(teamSelections => {
      Object.values(teamSelections).forEach(selection => {
        if (selection.playerId && selection.playerId !== "unassigned") {
          selectedPlayers.add(selection.playerId);
        }
      });
    });
  });
  
  return selectedPlayers;
}

export function mapPositionToSlot(position: string): string | null {
  // Common position mappings
  const positionMap: Record<string, string> = {
    // Goalkeepers
    'GK': 'GK',
    'GOALKEEPER': 'GK',
    
    // Defenders
    'LB': 'LB',
    'RB': 'RB',
    'CB': 'CB',
    'LCB': 'LCB',
    'RCB': 'RCB',
    'LWB': 'LWB',
    'RWB': 'RWB',
    'DC': 'DC',
    'DL': 'DL',
    'DR': 'DR',
    'DCL': 'DCL',
    'DCR': 'DCR',
    
    // Midfielders
    'DM': 'DM',
    'CM': 'CM',
    'LM': 'LM',
    'RM': 'RM',
    'CAM': 'CAM',
    'CDM': 'CDM',
    'LCM': 'LCM',
    'RCM': 'RCM',
    'MC': 'MC',
    'ML': 'ML',
    'MR': 'MR',
    'MCL': 'MCL',
    'MCR': 'MCR',
    'AMC': 'AMC',
    'AML': 'AML',
    'AMR': 'AMR',
    'AMCL': 'AMCL',
    'AMCR': 'AMCR',
    'DMC': 'DMC',
    'DMCL': 'DMCL',
    'DMCR': 'DMCR',
    
    // Forwards
    'LW': 'LW',
    'RW': 'RW',
    'ST': 'ST',
    'CF': 'CF',
    'LS': 'LS',
    'RS': 'RS',
    'STC': 'STC',
    'STCL': 'STCL',
    'STCR': 'STCR',
    
    // Special positions
    'SW': 'SW',
    'SUB': 'SUB',
  };
  
  // Try direct mapping
  if (position in positionMap) {
    return positionMap[position];
  }
  
  // If the position is already a slot ID (e.g., 'sub-0'), return it as is
  if (position.startsWith('sub-') || Object.values(positionMap).includes(position)) {
    return position;
  }
  
  // For substitutes, we'll handle them differently (in the calling code)
  if (position.toLowerCase().includes('sub')) {
    return 'SUB';
  }
  
  // If we can't map the position, return the original position
  return position;
}

export function areSelectionsEmpty(selections: AllSelections): boolean {
  if (!selections) return true;
  
  // Check if any periods have selections
  return Object.keys(selections).length === 0 || 
    Object.values(selections).every(periodSelections => 
      Object.keys(periodSelections).length === 0 || 
      Object.values(periodSelections).every(teamSelections => 
        Object.keys(teamSelections).length === 0
      )
    );
}
