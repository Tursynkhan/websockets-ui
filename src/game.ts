import { GameRoom, Ship } from "./types";

export const addShipsToGame = (room: GameRoom, playerId: string, ships: Ship[]) => {
  room.gameBoard[playerId] = ships;
};

export const attack = (room: GameRoom, playerId: string, x: number, y: number): string => {
  const enemyShips = room.gameBoard[room.players.find((p) => p.id !== playerId)?.id || ""];
  const hit = enemyShips?.some((ship) => ship.position.x === x && ship.position.y === y);
  return hit ? "hit" : "miss";
};
