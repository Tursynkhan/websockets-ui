import { Player } from "./types";
import { generateId } from "./utils";

const players = new Map<string, Player>();

export const registerPlayer = (name: string, password: string): Player | null => {
  if ([...players.values()].some((player) => player.name === name)) {
    return null;
  }
  const player: Player = { name, password, id: generateId(), wins: 0 };
  players.set(player.id, player);
  return player;
};

export const loginPlayer = (name: string, password: string): Player | null => {
  const player = [...players.values()].find((p) => p.name === name && p.password === password);
  return player || null;
};
