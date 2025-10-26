import { io, Socket } from "socket.io-client";

export interface CanvasElement {
  id: string;
  type: "rectangle" | "ellipse" | "path" | "text" | "note";
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  data: Record<string, any>;
}

export interface UserPresence {
  userId: string;
  userName: string;
  cursorX: number;
  cursorY: number;
  selectedElementId?: string;
  color: string;
}

export interface CanvasState {
  elements: CanvasElement[];
  presenceData: Map<string, UserPresence>;
  version: number;
}

export class CanvasCollaborationManager {
  private canvasId: string;
  private userId: string;
  private userName: string;
  private socket: Socket | null = null;
  private userColor: string;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(
    canvasId: string,
    userId: string,
    userName: string,
    userColor?: string,
  ) {
    this.canvasId = canvasId;
    this.userId = userId;
    this.userName = userName;
    this.userColor = userColor || generateUserColor();
  }

  connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
          console.log("Connected to collaboration server");

          this.socket!.emit("canvas:join", {
            canvasId: this.canvasId,
            userId: this.userId,
            userName: this.userName,
            color: this.userColor,
          });

          this.emit("connected");
          resolve();
        });

        this.socket.on("element:update", (data: any) => {
          this.emit("element-update", data.element, data.userId);
        });

        this.socket.on("cursor:update", (data: any) => {
          this.emit("cursor-update", {
            userId: data.userId,
            cursorX: data.x,
            cursorY: data.y,
            selectedElementId: data.selectedElementId,
            color: this.userColor,
            userName: this.userName,
          } as UserPresence);
        });

        this.socket.on("presence:update", (users: any[]) => {
          this.emit("presence-update", users);
        });

        this.socket.on("element:delete", (data: any) => {
          this.emit("element-delete", data.elementId, data.userId);
        });

        this.socket.on("canvas:sync", (elements: CanvasElement[]) => {
          this.emit("sync", elements, 0);
        });

        this.socket.on("user:joined", (data: any) => {
          this.emit("user-joined", data);
        });

        this.socket.on("user:left", (data: any) => {
          this.emit("user-left", data);
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from collaboration server");
          this.emit("disconnected");
        });

        this.socket.on("error", (error: any) => {
          console.error("Socket.io error:", error);
          this.emit("error", error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  updateElement(element: CanvasElement): void {
    if (this.socket) {
      this.socket.emit("element:update", {
        canvasId: this.canvasId,
        userId: this.userId,
        element,
      });
    }
  }

  updateCursor(x: number, y: number, selectedElementId?: string): void {
    if (this.socket) {
      this.socket.emit("cursor:update", {
        canvasId: this.canvasId,
        userId: this.userId,
        x,
        y,
        selectedElementId,
      });
    }
  }

  deleteElement(elementId: string): void {
    if (this.socket) {
      this.socket.emit("element:delete", {
        canvasId: this.canvasId,
        userId: this.userId,
        elementId,
      });
    }
  }

  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.emit("canvas:leave", {
        canvasId: this.canvasId,
        userId: this.userId,
      });
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

export function generateUserColor(): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
