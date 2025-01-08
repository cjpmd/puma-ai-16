import { create } from "zustand";
import { Player, Attribute, AttributeCategory, PlayerCategory } from "@/types/player";

interface PlayersState {
  players: Player[];
  addPlayer: (player: Omit<Player, "id" | "attributes" | "attributeHistory">) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  deletePlayer: (playerId: string) => void;
  updateAttribute: (playerId: string, attributeName: string, value: number) => void;
  updateMultiplier: (playerId: string, attributeName: string, multiplier: number) => void;
}

const ATTRIBUTES = {
  GOALKEEPING: [
    "Aerial Reach",
    "Command of Area",
    "Communication",
    "Eccentricity",
    "Handling",
    "Kicking",
    "One on Ones",
    "Punching",
    "Reflexes",
    "Rushing Out",
    "Throwing",
  ],
  TECHNICAL: [
    "Corners",
    "Crossing",
    "Dribbling",
    "Finishing",
    "First Touch",
    "Free Kicks",
    "Heading",
    "Long Shots",
    "Long Throws",
    "Marking",
    "Passing",
    "Penalties",
    "Tackling",
    "Technique",
  ],
  MENTAL: [
    "Aggression",
    "Anticipation",
    "Bravery",
    "Composure",
    "Concentration",
    "Decisions",
    "Determination",
    "Flair",
    "Leadership",
    "Off the Ball",
    "Positioning",
    "Teamwork",
    "Vision",
    "Work Rate",
  ],
  PHYSICAL: [
    "Acceleration",
    "Agility",
    "Balance",
    "Jumping",
    "Natural Fitness",
    "Pace",
    "Stamina",
    "Strength",
  ],
};

const generateInitialAttributes = () => {
  const attributes: Attribute[] = [];
  Object.entries(ATTRIBUTES).forEach(([category, names]) => {
    names.forEach((name) => {
      attributes.push({
        name,
        value: 10,
        category: category as AttributeCategory,
        multiplier: 1,
      });
    });
  });
  return attributes;
};

export const usePlayersStore = create<PlayersState>((set) => ({
  players: [],
  addPlayer: (player) => {
    const newPlayer: Player = {
      ...player,
      id: crypto.randomUUID(),
      attributes: generateInitialAttributes(),
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
  updateMultiplier: (playerId, attributeName, multiplier) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              attributes: player.attributes.map((attr) =>
                attr.name === attributeName ? { ...attr, multiplier } : attr
              ),
            }
          : player
      ),
    }));
  },
}));