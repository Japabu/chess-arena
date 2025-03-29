import { io, Socket } from "socket.io-client";
import { API_URL } from "./config";

let socketInstance: Socket | null = null;

export const socket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(API_URL);
  }
  return socketInstance;
};
