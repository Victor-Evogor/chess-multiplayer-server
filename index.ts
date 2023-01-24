import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { config } from "dotenv";
import { updateUser } from "./handlers/updateUser";
import {SocketEmitEvents} from "@shared/SocketEvents"
import { searchRandomPlayer } from "./handlers/searchRandomPlayer";
import { Game } from "./Game";
import { Move } from "@shared/Move";
import { makeMove } from "./handlers/makeMove";
import { challenge } from "./handlers/challenge";

config();

const PORT = process.env.PORT || 5000;

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connect", (socket) => {

  socket.on<SocketEmitEvents>("update user", (userData, callback) => {
    callback(updateUser(socket, userData))
  });
  
  socket.on<SocketEmitEvents>("searching for player",async (callback)=>{ 
    try {
      const opponent = await searchRandomPlayer(io, socket);
      const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      const game = new Game(opponent.id, socket.id, START);
      opponent.emit<SocketEmitEvents>("found player", game);
      socket.emit<SocketEmitEvents>("found player", game);
      socket.data.game = START;
    } catch (error: any) {
      callback(error.message);
    }
  });
  
  socket.on("make move", async (move:Move) => {
    try {
      await makeMove(socket, move)
    } catch (error: any) {
      socket.emit<SocketEmitEvents>("no user found", error.message);
    }
  })

  socket.on("challenge", (id:string, callback:Function)=>{
    challenge(socket, id, callback);
  })
});

httpServer.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
