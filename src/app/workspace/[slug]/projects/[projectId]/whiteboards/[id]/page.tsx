import { protectRoute } from "@/lib/auth-guard";
import { getCanvasById } from "@/features/whiteboards/actions";
import { WhiteboardClient } from "@/features/whiteboards/components/whiteboard-client";

interface WhiteboardPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
    id: string;
  }>;
}

export default async function WhiteboardPage({ params }: WhiteboardPageProps) {
  const session = await protectRoute();

  const { slug, projectId, id } = await params;
  const result = await getCanvasById(id);

  if (result.error || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Whiteboard not found</p>
      </div>
    );
  }

  const canvas = result.data;

  return (
    <WhiteboardClient
      canvasId={id}
      canvasTitle={canvas.title || "Untitled"}
      projectId={projectId}
      workspaceSlug={slug}
      userId={session.user?.id || ""}
      userName={session.user?.name || session.user?.email || "Anonymous"}
    />
  );
}
