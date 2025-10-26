import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface CanvasUser {
  id: string;
  name: string;
  color: string;
  cursorX: number;
  cursorY: number;
  selectedElementId?: string;
}

interface ActiveConnection {
  userId: string;
  userName: string;
  color: string;
  socket: Socket;
}

class CanvasServer {
  private io: SocketIOServer | null = null;
  private activeUsers: Map<string, Map<string, ActiveConnection>> = new Map();
  private canvasStates: Map<string, any[]> = new Map();

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        credentials: true,
      },
    });

    this.setupEventHandlers();
    return this.io;
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on(
        "canvas:join",
        (data: {
          canvasId: string;
          userId: string;
          userName: string;
          color: string;
        }) => {
          const { canvasId, userId, userName, color } = data;

          if (!this.activeUsers.has(canvasId)) {
            this.activeUsers.set(canvasId, new Map());
          }

          this.activeUsers.get(canvasId)!.set(userId, {
            userId,
            userName,
            color,
            socket,
          });

          socket.join(`canvas:${canvasId}`);

          this.io!.to(`canvas:${canvasId}`).emit("user:joined", {
            userId,
            userName,
            color,
          });

          const presence = Array.from(
            this.activeUsers.get(canvasId)!.values(),
          ).map((conn) => ({
            userId: conn.userId,
            userName: conn.userName,
            color: conn.color,
          }));

          socket.emit("presence:update", presence);

          if (this.canvasStates.has(canvasId)) {
            socket.emit("canvas:sync", this.canvasStates.get(canvasId));
          }
        },
      );

      socket.on(
        "element:update",
        (data: { canvasId: string; userId: string; element: any }) => {
          const { canvasId, userId, element } = data;

          if (!this.canvasStates.has(canvasId)) {
            this.canvasStates.set(canvasId, []);
          }

          const elements = this.canvasStates.get(canvasId)!;
          const index = elements.findIndex((e) => e.id === element.id);

          if (index !== -1) {
            elements[index] = element;
          } else {
            elements.push(element);
          }

          this.io!.to(`canvas:${canvasId}`).emit("element:update", {
            userId,
            element,
            timestamp: Date.now(),
          });
        },
      );

      socket.on(
        "element:delete",
        (data: { canvasId: string; userId: string; elementId: string }) => {
          const { canvasId, userId, elementId } = data;

          if (this.canvasStates.has(canvasId)) {
            const elements = this.canvasStates.get(canvasId)!;
            const index = elements.findIndex((e) => e.id === elementId);
            if (index !== -1) {
              elements.splice(index, 1);
            }
          }

          this.io!.to(`canvas:${canvasId}`).emit("element:delete", {
            userId,
            elementId,
            timestamp: Date.now(),
          });
        },
      );

      socket.on(
        "cursor:update",
        (data: {
          canvasId: string;
          userId: string;
          x: number;
          y: number;
          selectedElementId?: string;
        }) => {
          const { canvasId, userId, x, y, selectedElementId } = data;

          if (this.activeUsers.has(canvasId)) {
            const connection = this.activeUsers.get(canvasId)!.get(userId);
            if (connection) {
              connection.socket = socket;
            }
          }

          socket.to(`canvas:${canvasId}`).emit("cursor:update", {
            userId,
            x,
            y,
            selectedElementId,
            timestamp: Date.now(),
          });
        },
      );

      socket.on(
        "canvas:leave",
        (data: { canvasId: string; userId: string }) => {
          const { canvasId, userId } = data;

          if (this.activeUsers.has(canvasId)) {
            this.activeUsers.get(canvasId)!.delete(userId);

            this.io!.to(`canvas:${canvasId}`).emit("user:left", { userId });
          }

          socket.leave(`canvas:${canvasId}`);
        },
      );

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        for (const [canvasId, users] of this.activeUsers.entries()) {
          for (const [userId, conn] of users.entries()) {
            if (conn.socket.id === socket.id) {
              users.delete(userId);
              this.io!.to(`canvas:${canvasId}`).emit("user:left", { userId });
            }
          }
        }
      });
    });
  }

  getIO() {
    return this.io;
  }
}

export const canvasServer = new CanvasServer();
