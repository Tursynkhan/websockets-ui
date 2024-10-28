export interface Player {
  name: string;
  password: string;
  id: string;
  wins: number;
}

export interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
}

export interface GameRoom {
  id: string;
  players: Player[];
  gameBoard: { [key: string]: Ship[] };
}

export interface Message {
  type: string;
  data: any;
  id: number;
}

export type Command = "reg" | "create_room" | "add_user_to_room" | "add_ships" | "attack" | "randomAttack";
