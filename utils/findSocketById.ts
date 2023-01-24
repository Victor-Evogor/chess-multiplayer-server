import { io } from "..";

export const findSocketById = async (id: string) =>
  (await io.fetchSockets()).find((socket) => socket.id === id);
