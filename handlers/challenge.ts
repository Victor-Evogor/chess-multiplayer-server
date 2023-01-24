import { SocketEmitEvents } from "@shared/SocketEvents";
import { Socket } from "socket.io";
import { findSocketById } from "../utils/findSocketById";

export const challenge = async (
  socket: Socket,
  id: string,
  callback: Function
) => {
  const opponent = await findSocketById(id);
  if (!opponent) {
    callback("No user found");
    return;
  }

  if (!opponent.data.idle) {
    callback("Opponent is busy");
    return;
  }
  console.log("Received challenge from " + socket.id);
  opponent.emit<SocketEmitEvents>(
    "challenge made",
    { p1: socket.id, p2: opponent.id },
    callback
  );
};
