import { protectRoute } from "@/lib/auth-guard";
import { getWorkspaceBoards } from "@/features/boards/actions";
import { BoardList } from "@/features/boards/components/board-list";

interface BoardsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardsPage({ params }: BoardsPageProps) {
  await protectRoute();

  const { slug } = await params;

  const result = await getWorkspaceBoards(slug);

  if (result.error || !result.workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {result.error || "Failed to load boards"}
        </p>
      </div>
    );
  }

  return (
    <BoardList boards={result.data || []} workspaceId={result.workspaceId} />
  );
}
