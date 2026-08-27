import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

let io: Server | null = null;

export const initSocketIo = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Or specific origins if restricted
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string, role: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.userId;
    
    // Join a room specifically for this user to receive direct messages
    socket.join(userId);

    socket.on("disconnect", () => {
      // Automatic leave happens on disconnect
    });
  });

  return io;
};

export const getSocketIo = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
