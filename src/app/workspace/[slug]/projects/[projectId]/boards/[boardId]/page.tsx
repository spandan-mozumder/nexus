import { protectRoute } from "@/lib/auth-guard";
import { getBoardById } from "@/features/boards/actions";

interface BoardPageProps {
  params: Promise<{
    slug: string;
    projectId: string;
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  await protectRoute();

  const { slug, projectId, boardId } = await params;
  const result = await getBoardById(boardId);

  if (result.error || !result.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const board = result.data;

  return (
    <div className="flex-1 h-full">
      <div className="p-6">
        <h1 className="text-3xl font-bold">{board.title}</h1>
        {board.description && (
          <p className="text-muted-foreground mt-2">{board.description}</p>
        )}
      </div>
      {}
    </div>
  );
}
