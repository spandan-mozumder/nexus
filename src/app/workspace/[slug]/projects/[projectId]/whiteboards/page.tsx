import { protectRoute } from "@/lib/auth-guard";
import { getProjectById } from "@/features/projects/actions";
import { getProjectCanvases } from "@/features/whiteboards/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Palette, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function ProjectWhiteboardsList({ projectId }: { projectId: string }) {
  const canvasesResult = await getProjectCanvases(projectId);

  if (canvasesResult.error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading whiteboards</p>
      </div>
    );
  }

  const canvases = canvasesResult.data || [];

  if (canvases.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No whiteboards yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first whiteboard to start collaborating visually
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {canvases.map((canvas) => (
        <Link
          key={canvas.id}
          href={`/workspace/${canvas.workspaceId}/whiteboard/${canvas.id}`}
        >
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <div className="h-20 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold text-lg">
                <Palette className="h-8 w-8" />
              </div>
              <CardTitle className="text-base line-clamp-2">
                {canvas.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  <span>{canvas._count.layers} layers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(canvas.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function ProjectWhiteboardsPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  await protectRoute();

  const { slug, projectId } = await params;
  const result = await getProjectById(projectId);

  if (result.error || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const project = result.data;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {project.name} - Whiteboards
          </h2>
          <p className="text-muted-foreground">
            Manage your project whiteboards and diagrams
          </p>
        </div>
        <Link href={`/workspace/${slug}/whiteboard/new?projectId=${projectId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Whiteboard
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <ProjectWhiteboardsList projectId={projectId} />
      </Suspense>
    </div>
  );
}
