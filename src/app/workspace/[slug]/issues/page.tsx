import { protectRoute } from "@/lib/auth-guard";
import { getWorkspaceIssues } from "@/features/issues/actions";
import { IssuesList } from "@/features/issues/components/issues-list";

interface IssuesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function IssuesPage({ params }: IssuesPageProps) {
  await protectRoute();

  const { slug } = await params;

  const result = await getWorkspaceIssues(slug);

  if (result.error || !result.workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {result.error || "Failed to load issues"}
        </p>
      </div>
    );
  }

  return (
    <IssuesList
      issues={result.data || []}
      workspaceId={result.workspaceId}
      workspaceSlug={slug}
    />
  );
}
