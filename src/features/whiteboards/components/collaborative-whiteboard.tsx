"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CanvasCollaborationManager,
  CanvasElement,
  UserPresence,
  generateUserColor,
} from "@/lib/collaboration";
import { Button } from "@/components/ui/button";
import { Palette, Trash2, Type, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CollaborativeWhiteboardProps {
  canvasId: string;
  userId: string;
  userName: string;
  projectId: string;
  workspaceSlug: string;
  onSave?: (elements: CanvasElement[]) => void;
}

export function CollaborativeWhiteboard({
  canvasId,
  userId,
  userName,
  projectId,
  workspaceSlug,
}: CollaborativeWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<
    "pen" | "rectangle" | "ellipse" | "text" | "eraser"
  >("pen");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [collaborators, setCollaborators] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collaboratorCursors, setCollaboratorCursors] = useState<
    Map<string, UserPresence>
  >(new Map());

  const managerRef = useRef<CanvasCollaborationManager | null>(null);
  const currentPathRef = useRef<Array<{ x: number; y: number }>>([]);
  const userColorRef = useRef<string>(generateUserColor());
  const unsaveChangesRef = useRef(false);

  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const container = containerRef.current;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const manager = new CanvasCollaborationManager(
        canvasId,
        userId,
        userName,
        userColorRef.current,
      );

      managerRef.current = manager;

      manager.on("sync", (newElements: CanvasElement[]) => {
        setElements(newElements);
        redrawCanvas(canvas, newElements);
      });

      manager.on("presence-update", (presence: UserPresence[]) => {
        setCollaborators(presence.filter((p) => p.userId !== userId));
      });

      manager.on("connected", () => {
        setIsConnected(true);
      });

      manager.on("disconnected", () => {
        setIsConnected(false);
        toast.error("Disconnected from collaboration server");
      });

      const serverUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
      await manager.connect(serverUrl);
      setIsLoading(false);
    };

    initializeCanvas();

    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
      }
    };
  }, [canvasId, userId, userName]);

  const redrawCanvas = (
    canvas: HTMLCanvasElement,
    elementsToRender: CanvasElement[],
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elementsToRender.forEach((element) => {
      drawElement(ctx, element);
    });

    collaboratorCursors.forEach((collaborator) => {
      drawCursor(ctx, collaborator);
    });
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    const gridSize = 20;
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    for (let i = 0; i < height; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  };

  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: CanvasElement,
  ) => {
    ctx.save();
    ctx.translate(element.x, element.y);

    switch (element.type) {
      case "rectangle":
        ctx.strokeStyle = element.data.color || "#000";
        ctx.lineWidth = element.data.size || 2;
        ctx.strokeRect(0, 0, element.width, element.height);
        break;

      case "ellipse":
        ctx.strokeStyle = element.data.color || "#000";
        ctx.lineWidth = element.data.size || 2;
        ctx.beginPath();
        ctx.ellipse(
          element.width / 2,
          element.height / 2,
          element.width / 2,
          element.height / 2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
        break;

      case "path":
        ctx.strokeStyle = element.data.color || "#000";
        ctx.lineWidth = element.data.size || 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        if (element.data.points && element.data.points.length > 0) {
          const points = element.data.points;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);

          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "text":
        ctx.fillStyle = element.data.color || "#000";
        ctx.font = `${element.data.size || 16}px Arial`;
        ctx.fillText(element.data.text || "", 0, element.data.size || 16);
        break;
    }

    ctx.restore();
  };

  const drawCursor = (
    ctx: CanvasRenderingContext2D,
    collaborator: UserPresence,
  ) => {
    const x = collaborator.cursorX;
    const y = collaborator.cursorY;

    ctx.fillStyle = collaborator.color;
    ctx.fillRect(x, y, 12, 16);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "12px Arial";
    ctx.fillText(collaborator.userName, x + 14, y + 12);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !managerRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setIsDrawing(true);
      currentPathRef.current = [{ x, y }];

      if (tool === "pen") {
        currentPathRef.current = [{ x, y }];
      }
    },
    [tool],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || !managerRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      managerRef.current.updateCursor(x, y);

      if (!isDrawing || tool === "eraser") return;

      if (tool === "pen") {
        currentPathRef.current.push({ x, y });
      }
    },
    [isDrawing, tool],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !managerRef.current || !tool) return;

    setIsDrawing(false);

    if (tool === "pen" && currentPathRef.current.length > 0) {
      const element: CanvasElement = {
        id: Math.random().toString(36).substr(2, 9),
        type: "path",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        zIndex: 1,
        data: {
          color,
          size: brushSize,
          points: currentPathRef.current,
        },
      };

      managerRef.current.updateElement(element);
      unsaveChangesRef.current = true;
    }

    currentPathRef.current = [];
  }, [isDrawing, tool, color, brushSize]);

  const handleClear = () => {
    if (managerRef.current && elements.length > 0) {
      elements.forEach((element) => {
        managerRef.current?.deleteElement(element.id);
      });
      unsaveChangesRef.current = true;
      toast.success("Canvas cleared");
    }
  };

  const handleUndo = () => {
    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      if (managerRef.current) {
        managerRef.current.deleteElement(lastElement.id);
        unsaveChangesRef.current = true;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected" : "Disconnected"} •{" "}
            {collaborators.length} collaborator
            {collaborators.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTool("pen")}
            className={tool === "pen" ? "bg-gray-100" : ""}
          >
            Pen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTool("rectangle")}
            className={tool === "rectangle" ? "bg-gray-100" : ""}
          >
            Rectangle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTool("ellipse")}
            className={tool === "ellipse" ? "bg-gray-100" : ""}
          >
            Ellipse
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTool("text")}
            className={tool === "text" ? "bg-gray-100" : ""}
          >
            <Type className="w-4 h-4" />
          </Button>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 cursor-pointer rounded border"
            title="Color picker"
          />

          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
            title="Brush size"
          />

          <Button variant="outline" size="sm" onClick={handleUndo}>
            Undo
          </Button>

          <Button variant="destructive" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair bg-white block"
        />
      </div>
    </div>
  );
}
