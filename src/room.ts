import { GameRoom, Player } from "./types";
import { generateId } from "./utils";

const rooms = new Map<string, GameRoom>();

export const createRoom = (player: Player): GameRoom => {
  const room: GameRoom = { id: generateId(), players: [player], gameBoard: {} };
  rooms.set(room.id, room);
  return room;
};

export const addUserToRoom = (roomId: string, player: Player): GameRoom | null => {
  const room = rooms.get(roomId);
  if (room && room.players.length < 2) {
    room.players.push(player);
    return room;
  }
  return null;
};
