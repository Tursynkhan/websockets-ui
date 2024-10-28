import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { registerPlayer, loginPlayer } from './player.js';
import { createRoom, addUserToRoom } from './room.js';
import { addShipsToGame, attack } from './game.js';
import { Message } from './types.js';
import { parseJSON } from './utils.js';
import { Player, GameRoom } from './types.js';

const players = new Map<string, Player>();
const rooms = new Map<string, GameRoom>();

const __dirname = path.resolve(path.dirname(''));
const httpServer = http.createServer((req, res) => {
    const file_path = path.join(__dirname, 'front', req.url === '/' ? 'index.html' : req.url || '');
    fs.readFile(file_path, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: WebSocket) => {
    console.log("A new client connected");

    ws.on('message', (data) => {
        const msg = parseJSON(data.toString()) as Message;
        if (!msg) return;

        switch (msg.type) {
            case "reg":
                handleRegistration(ws, msg);
                break;
            case "create_room":
                handleCreateRoom(ws, msg);
                break;
            case "add_user_to_room":
                handleJoinRoom(ws, msg);
                break;
            case "add_ships":
                handleAddShips(ws, msg);
                break;
            case "attack":
                handleAttack(ws, msg);
                break;
            default:
                console.log("Unknown message type:", msg.type);
        }
    });

    ws.on('close', () => {
        console.log("Client disconnected");
    });
});

function handleRegistration(ws: WebSocket, msg: Message) {
    const { name, password } = msg.data;
    const player = registerPlayer(name, password);
    const response = player
        ? { type: "reg", data: { name, index: player.id, error: false, errorText: "" }, id: msg.id }
        : { type: "reg", data: { name, index: null, error: true, errorText: "Player already exists" }, id: msg.id };
    ws.send(JSON.stringify(response));
}

function handleCreateRoom(ws: WebSocket, msg: Message) {
    const player = loginPlayer(msg.data.name, msg.data.password);
    if (!player) {
        ws.send(JSON.stringify({ type: "error", data: "Login failed", id: msg.id }));
        return;
    }
    const room = createRoom(player);
    rooms.set(room.id, room); 
    ws.send(JSON.stringify({ type: "update_room", data: [{ roomId: room.id, roomUsers: [{ name: player.name, index: player.id }] }], id: msg.id }));
}

function handleJoinRoom(ws: WebSocket, msg: Message) {
    const playerName = msg.data.name;
    const player = players.get(playerName);

    if (!player) {
        ws.send(JSON.stringify({ type: "error", data: "Player not registered", id: msg.id }));
        return;
    }

    const room = rooms.get(msg.data.indexRoom);
    if (!room) {
        ws.send(JSON.stringify({ type: "error", data: "Room not found", id: msg.id }));
        return;
    }

    if (room.players.length >= 2) {
        ws.send(JSON.stringify({ type: "error", data: "Room is full", id: msg.id }));
        return;
    }

    room.players.push(player);
    ws.send(JSON.stringify({
        type: "create_game",
        data: { idGame: room.id, idPlayer: player.id },
        id: msg.id
    }));
}

function handleAddShips(ws: WebSocket, msg: Message) {
    const { gameId, ships, indexPlayer } = msg.data;
    const room = rooms.get(gameId);
    if (room) {
        addShipsToGame(room, indexPlayer, ships);
        if (room.players.every((p) => room.gameBoard[p.id])) {
            ws.send(JSON.stringify({ type: "start_game", data: { ships, currentPlayerIndex: indexPlayer }, id: msg.id }));
        }
    }
}

function handleAttack(ws: WebSocket, msg: Message) {
    const { gameId, x, y, indexPlayer } = msg.data;
    const room = rooms.get(gameId);
    if (!room) return;
    const result = attack(room, indexPlayer, x, y);
    ws.send(JSON.stringify({ type: "attack", data: { position: { x, y }, currentPlayer: indexPlayer, status: result }, id: msg.id }));
}

const HTTP_PORT = 8181;
console.log(`Server is running at http://localhost:${HTTP_PORT}`);
httpServer.listen(HTTP_PORT);
