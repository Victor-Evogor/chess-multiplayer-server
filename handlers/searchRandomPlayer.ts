import { SocketEmitEvents } from "@shared/SocketEvents";
import { Server, Socket, RemoteSocket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { tick } from "../utils/tick";

export const searchRandomPlayer = async (io: Server, socket: Socket) => {
  const sockets = await io.fetchSockets();
  let searching = true
  if (sockets.length === 1) throw new Error("Opponent not found");
  let opponent: RemoteSocket<DefaultEventsMap, any[]> | undefined;
  for (let n = 10; n !== 0; --n) {
    opponent = sockets.find(
      (opponentSocket) =>
        opponentSocket.data.searching && opponentSocket.id !== socket.id
    );
    socket.on<SocketEmitEvents>("cancel search", ()=>{
      searching = false;
    })
    if(!searching){
      socket.data.searching = false;
      socket.data.idle = true;
      break;
    }
    
    if (opponent) return opponent;
    await tick(1000);
  }
  throw new Error("Opponent not found");
};
