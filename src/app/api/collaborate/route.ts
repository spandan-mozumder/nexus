import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const canvasConnections = new Map<
  string,
  Set<{ ws: any; userId: string; userName: string }>
>();

const canvasStates = new Map<string, any>();

export async function GET(request: Request) {
  const upgrade = request.headers.get("upgrade");
  if (upgrade !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const url = new URL(request.url);
  const canvasId = url.searchParams.get("canvasId");
  const userId = url.searchParams.get("userId");
  const userName = url.searchParams.get("userName");

  if (!canvasId || !userId || !userName) {
    return new Response("Missing parameters", { status: 400 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const canvas = await db.canvas.findUnique({
      where: { id: canvasId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (
      !canvas ||
      (canvas.project.isPrivate && canvas.project.members.length === 0)
    ) {
      return new Response("Access denied", { status: 403 });
    }
  } catch (error) {
    console.error("Authorization error:", error);
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(null, {
    status: 101,
    statusText: "Switching Protocols",
    headers: {
      Upgrade: "websocket",
      Connection: "Upgrade",
      "Sec-WebSocket-Accept": "key",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, canvasId, userId, action, data } = body;

    const canvas = await db.canvas.findUnique({
      where: { id: canvasId },
    });

    if (!canvas) {
      return Response.json({ error: "Canvas not found" }, { status: 404 });
    }

    switch (type) {
      case "update-element":
        return handleElementUpdate(canvasId, userId, data);

      case "delete-element":
        return handleElementDelete(canvasId, userId, data);

      case "sync":
        return handleSync(canvasId);

      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Collaboration API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleElementUpdate(
  canvasId: string,
  userId: string,
  element: any,
) {
  try {
    if (element.id) {
      await db.canvasLayer.update({
        where: { id: element.id },
        data: {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          zIndex: element.zIndex,
          data: element.data,
        },
      });
    } else {
      const layer = await db.canvasLayer.create({
        data: {
          canvasId,
          type: element.type,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          zIndex: element.zIndex,
          data: element.data,
        },
      });
      return Response.json({ success: true, id: layer.id });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Element update error:", error);
    return Response.json(
      { error: "Failed to update element" },
      { status: 500 },
    );
  }
}

async function handleElementDelete(
  canvasId: string,
  userId: string,
  elementId: string,
) {
  try {
    await db.canvasLayer.delete({
      where: { id: elementId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Element delete error:", error);
    return Response.json(
      { error: "Failed to delete element" },
      { status: 500 },
    );
  }
}

async function handleSync(canvasId: string) {
  try {
    const layers = await db.canvasLayer.findMany({
      where: { canvasId },
      orderBy: { zIndex: "asc" },
    });

    return Response.json({ success: true, elements: layers });
  } catch (error) {
    console.error("Sync error:", error);
    return Response.json({ error: "Failed to sync" }, { status: 500 });
  }
}
