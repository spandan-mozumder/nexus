"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLayer,
  updateLayer,
  deleteLayer,
  bringLayerToFront,
} from "../actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Square,
  Circle,
  Type,
  StickyNote,
  MousePointer,
  Eraser,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toast } from "sonner";

type Tool =
  | "select"
  | "pen"
  | "rectangle"
  | "ellipse"
  | "text"
  | "note"
  | "eraser";
type LayerType = "RECTANGLE" | "ELLIPSE" | "PATH" | "TEXT" | "NOTE";

interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  data: any;
}

interface WhiteboardCanvasProps {
  canvasId: string;
  layers: Layer[];
  workspaceId: string;
}

const tools = [
  { id: "select" as Tool, icon: MousePointer, label: "Select" },
  { id: "pen" as Tool, icon: Pencil, label: "Pen" },
  { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
  { id: "ellipse" as Tool, icon: Circle, label: "Circle" },
  { id: "text" as Tool, icon: Type, label: "Text" },
  { id: "note" as Tool, icon: StickyNote, label: "Sticky Note" },
  { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
];

export function WhiteboardCanvas({
  canvasId,
  layers,
  workspaceId,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const queryClient = useQueryClient();

  const createLayerMutation = useMutation({
    mutationFn: createLayer,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        queryClient.invalidateQueries({ queryKey: ["canvas", canvasId] });
      }
    },
  });

  const updateLayerMutation = useMutation({
    mutationFn: updateLayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canvas", canvasId] });
    },
  });

  const deleteLayerMutation = useMutation({
    mutationFn: deleteLayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canvas", canvasId] });
      setSelectedLayer(null);
    },
  });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoom, zoom);

    layers.forEach((layer) => {
      ctx.save();

      switch (layer.type) {
        case "RECTANGLE":
          ctx.fillStyle = layer.data.color || "#3b82f6";
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          if (selectedLayer === layer.id) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          }
          break;

        case "ELLIPSE":
          ctx.fillStyle = layer.data.color || "#8b5cf6";
          ctx.beginPath();
          ctx.ellipse(
            layer.x + layer.width / 2,
            layer.y + layer.height / 2,
            Math.abs(layer.width / 2),
            Math.abs(layer.height / 2),
            0,
            0,
            2 * Math.PI,
          );
          ctx.fill();
          if (selectedLayer === layer.id) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;

        case "PATH":
          if (layer.data.points && layer.data.points.length > 0) {
            ctx.strokeStyle = layer.data.color || "#000000";
            ctx.lineWidth = layer.data.lineWidth || 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(layer.data.points[0].x, layer.data.points[0].y);
            layer.data.points.forEach((point: { x: number; y: number }) => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;

        case "NOTE":
          ctx.fillStyle = layer.data.color || "#fef3c7";
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
          ctx.strokeStyle = "#ca8a04";
          ctx.lineWidth = 1;
          ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);

          if (layer.data.text) {
            ctx.fillStyle = "#000000";
            ctx.font = "14px sans-serif";
            ctx.fillText(
              layer.data.text,
              layer.x + 10,
              layer.y + 25,
              layer.width - 20,
            );
          }

          if (selectedLayer === layer.id) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
          }
          break;

        case "TEXT":
          if (layer.data.text) {
            ctx.fillStyle = layer.data.color || "#000000";
            ctx.font = `${layer.data.fontSize || 16}px sans-serif`;
            ctx.fillText(layer.data.text, layer.x, layer.y);
          }
          break;
      }

      ctx.restore();
    });

    ctx.restore();
  }, [layers, selectedLayer, zoom]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (selectedTool === "select") {
      const clicked = [...layers]
        .reverse()
        .find(
          (layer) =>
            pos.x >= layer.x &&
            pos.x <= layer.x + layer.width &&
            pos.y >= layer.y &&
            pos.y <= layer.y + layer.height,
        );
      setSelectedLayer(clicked?.id || null);
    } else if (selectedTool === "pen") {
      setIsDrawing(true);
      setCurrentPath([pos]);
    } else if (selectedTool === "eraser") {
      const clicked = [...layers]
        .reverse()
        .find(
          (layer) =>
            pos.x >= layer.x &&
            pos.x <= layer.x + layer.width &&
            pos.y >= layer.y &&
            pos.y <= layer.y + layer.height,
        );
      if (clicked) {
        deleteLayerMutation.mutate({ id: clicked.id });
      }
    } else {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);

    if (selectedTool === "pen") {
      setCurrentPath((prev) => [...prev, pos]);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && currentPath.length > 0) {
        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(
          currentPath[currentPath.length - 1].x,
          currentPath[currentPath.length - 1].y,
        );
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const endPos = getMousePos(e);
    const startPos = currentPath[0];

    if (selectedTool === "rectangle") {
      createLayerMutation.mutate({
        canvasId,
        type: "RECTANGLE",
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        data: { color: "#3b82f6" },
      });
    } else if (selectedTool === "ellipse") {
      createLayerMutation.mutate({
        canvasId,
        type: "ELLIPSE",
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.abs(endPos.x - startPos.x),
        height: Math.abs(endPos.y - startPos.y),
        data: { color: "#8b5cf6" },
      });
    } else if (selectedTool === "pen" && currentPath.length > 1) {
      const minX = Math.min(...currentPath.map((p) => p.x));
      const maxX = Math.max(...currentPath.map((p) => p.x));
      const minY = Math.min(...currentPath.map((p) => p.y));
      const maxY = Math.max(...currentPath.map((p) => p.y));

      createLayerMutation.mutate({
        canvasId,
        type: "PATH",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        data: { points: currentPath, color: "#000000", lineWidth: 2 },
      });
    } else if (selectedTool === "note") {
      createLayerMutation.mutate({
        canvasId,
        type: "NOTE",
        x: Math.min(startPos.x, endPos.x),
        y: Math.min(startPos.y, endPos.y),
        width: Math.max(Math.abs(endPos.x - startPos.x), 150),
        height: Math.max(Math.abs(endPos.y - startPos.y), 150),
        data: { color: "#fef3c7", text: "Double-click to edit" },
      });
    }

    setIsDrawing(false);
    setCurrentPath([]);
  };

  return (
    <div className="flex flex-col h-full">
      {}
      <div className="border-b p-2 flex items-center gap-2">
        <div className="flex gap-1 border-r pr-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedTool(tool.id)}
              title={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex gap-1 border-r pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.1))}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 flex items-center">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {selectedLayer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteLayerMutation.mutate({ id: selectedLayer })}
            title="Delete Selected"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        <div className="ml-auto text-xs text-muted-foreground">
          {layers.length} objects
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto bg-muted/20">
        <canvas
          ref={canvasRef}
          width={2000}
          height={1500}
          className={cn(
            "border bg-white",
            selectedTool === "pen" && "cursor-crosshair",
            selectedTool === "eraser" && "cursor-pointer",
            selectedTool === "select" && "cursor-default",
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDrawing(false);
            setCurrentPath([]);
          }}
        />
      </div>
    </div>
  );
}
