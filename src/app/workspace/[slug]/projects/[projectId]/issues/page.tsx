import { protectRoute } from "@/lib/auth-guard";
import {
  getProjectById,
  getProjectIssues,
  updateIssue,
} from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { IssuesKanbanBoard } from "@/features/projects/components/issues-kanban-board";

async function handleStatusChange(issueId: string, newStatus: string) {
  "use server";
  await updateIssue({
    id: issueId,
    status: newStatus as any,
  });
}

export default async function ProjectIssuesPage({
  params,
}: {
  params: Promise<{ slug: string; projectId: string }>;
}) {
  await protectRoute();

  const { slug, projectId } = await params;
  const [projectResult, issuesResult] = await Promise.all([
    getProjectById(projectId),
    getProjectIssues(projectId),
  ]);

  if (projectResult.error || !projectResult.data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const project = projectResult.data;
  const issues = issuesResult.success ? issuesResult.data : [];

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {project.name} - Issues
            </h2>
            <p className="text-muted-foreground">
              Drag and drop issues to change their status
            </p>
          </div>
          <Link href={`/workspace/${slug}/projects/${projectId}/issues/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <IssuesKanbanBoard
          issues={issues}
          projectId={projectId}
          workspaceSlug={slug}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
