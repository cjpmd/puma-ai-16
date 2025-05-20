
import { create } from "zustand";
import { Player, PlayerAttribute, AttributeCategory } from "@/types/player";
import { GOALKEEPER_ATTRIBUTES, TECHNICAL_ATTRIBUTES, MENTAL_ATTRIBUTES, PHYSICAL_ATTRIBUTES } from "@/constants/attributes";

interface PlayersState {
  players: Player[];
  globalMultiplier: number;
  addPlayer: (player: Omit<Player, "id" | "attributes" | "attributeHistory">) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  deletePlayer: (playerId: string) => void;
  updateAttribute: (playerId: string, attributeName: string, value: number) => void;
  updateGlobalMultiplier: (multiplier: number) => void;
}

const generateInitialAttributes = (playerType: string) => {
  const attributes: PlayerAttribute[] = [];
  const now = new Date().toISOString();
  
  if (playerType === "GOALKEEPER") {
    GOALKEEPER_ATTRIBUTES.forEach((attr) => {
      attributes.push({
        id: crypto.randomUUID(),
        name: attr.name,
        value: 10,
        category: attr.category as AttributeCategory,
        player_id: "", // Will be set after player creation
        created_at: now
      });
    });
  } else {
    // For outfield players
    [...TECHNICAL_ATTRIBUTES, ...MENTAL_ATTRIBUTES, ...PHYSICAL_ATTRIBUTES].forEach((attr) => {
      attributes.push({
        id: crypto.randomUUID(),
        name: attr.name,
        value: 10,
        category: attr.category as AttributeCategory,
        player_id: "", // Will be set after player creation
        created_at: now
      });
    });
  }
  
  return attributes;
};

export const usePlayersStore = create<PlayersState>((set) => ({
  players: [],
  globalMultiplier: 1,
  addPlayer: (player) => {
    const playerId = crypto.randomUUID();
    const attributes = generateInitialAttributes(player.playerType);
    
    // Set player_id for all attributes
    attributes.forEach(attr => {
      attr.player_id = playerId;
    });
    
    const newPlayer: Player = {
      ...player,
      id: playerId,
      attributes: attributes,
      attributeHistory: {},
    };
    
    set((state) => ({
      players: [...state.players, newPlayer],
    }));
  },
  updatePlayer: (playerId, updates) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, ...updates } : player
      ),
    }));
  },
  deletePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((player) => player.id !== playerId),
    }));
  },
  updateAttribute: (playerId, attributeName, value) => {
    set((state) => ({
      players: state.players.map((player) => {
        if (player.id !== playerId) return player;

        const updatedAttributes = player.attributes.map((attr) =>
          attr.name === attributeName ? { ...attr, value } : attr
        );

        const now = new Date().toISOString();
        const history = player.attributeHistory[attributeName] || [];
        const updatedHistory = {
          ...player.attributeHistory,
          [attributeName]: [...history, { date: now, value }],
        };

        return {
          ...player,
          attributes: updatedAttributes,
          attributeHistory: updatedHistory,
        };
      }),
    }));
  },
  updateGlobalMultiplier: (multiplier) => {
    set({ globalMultiplier: multiplier });
  },
}));
