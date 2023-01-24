import {Socket} from "socket.io"
import {User} from "@shared/User"

export const updateUser = (socket:Socket, updates:User) => {
  (Object.keys(updates) as ("idle"|"game"| "searching")[]).forEach((key) => {
    socket.data[key] = updates[key]
  })
  return socket.data;
}
