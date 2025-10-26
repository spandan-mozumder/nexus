import { protectRoute } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { WhiteboardCanvas } from "@/features/whiteboards/components/whiteboard-canvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface WhiteboardPageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function WhiteboardPage({ params }: WhiteboardPageProps) {
  await protectRoute();

  const { slug, id } = await params;

  const canvas = await db.canvas.findFirst({
    where: {
      id,
      workspaceId: slug,
    },
    include: {
      layers: {
        orderBy: {
          zIndex: "asc",
        },
      },
    },
  });

  if (!canvas) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Whiteboard not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="border-b px-6 py-3 flex items-center gap-4">
        <Link href={`/workspace/${slug}/whiteboards`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">{canvas.title}</h1>
      </div>

      <WhiteboardCanvas
        canvasId={id}
        layers={canvas.layers}
        workspaceId={slug}
      />
    </div>
  );
}
