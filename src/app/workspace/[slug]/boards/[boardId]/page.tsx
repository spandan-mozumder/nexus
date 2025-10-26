import { protectRoute } from "@/lib/auth-guard";
import { getBoardById } from "@/features/boards/actions";
import { KanbanBoard } from "@/features/boards/components/kanban-board";

interface BoardPageProps {
  params: Promise<{ slug: string; boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  await protectRoute();

  const { boardId } = await params;

  const result = await getBoardById(boardId);

  if (result.error || !result.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Board not found</p>
          <p className="text-sm text-muted-foreground">
            {result.error || "The board you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return <KanbanBoard board={result.data} />;
}
