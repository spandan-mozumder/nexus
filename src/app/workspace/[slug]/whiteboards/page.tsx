import { protectRoute } from "@/lib/auth-guard";
import { getWorkspaceCanvases } from "@/features/whiteboards/actions";
import { WhiteboardsList } from "@/features/whiteboards/components/whiteboards-list";

interface WhiteboardsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WhiteboardsPage({
  params,
}: WhiteboardsPageProps) {
  await protectRoute();

  const { slug } = await params;

  const result = await getWorkspaceCanvases(slug);

  if (result.error || !result.workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {result.error || "Failed to load whiteboards"}
        </p>
      </div>
    );
  }

  return (
    <WhiteboardsList
      canvases={result.data || []}
      workspaceId={result.workspaceId}
      workspaceSlug={slug}
    />
  );
}
