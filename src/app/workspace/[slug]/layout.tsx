import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getWorkspaceBySlug } from "@/features/workspaces/actions";
import { getUserProjects } from "@/features/workspaces/actions-nav";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav-project";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function SidebarSkeleton() {
  return (
    <div className="fixed left-0 top-0 h-screen w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col overflow-hidden">
      <div className="p-4 border-b space-y-3 flex-shrink-0">
        <Skeleton className="h-9 w-full" />
        <div className="px-2 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="p-3 border-b flex-shrink-0">
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex-1 p-3 space-y-2">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

async function WorkspaceSidebar({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  const [result, projectsResult] = await Promise.all([
    getWorkspaceBySlug(slug),
    getUserProjects(slug),
  ]);

  if (result.error || !result.workspace) {
    redirect("/dashboard");
  }

  const projects = projectsResult.success ? projectsResult.data : [];

  return (
    <WorkspaceNav
      workspace={result.workspace}
      user={{ id: userId }}
      projects={projects}
    />
  );
}

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await protectRoute();

  const { slug } = await params;

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<SidebarSkeleton />}>
        <WorkspaceSidebar slug={slug} userId={session.user.id} />
      </Suspense>
      <main className="flex-1 ml-72">{children}</main>
    </div>
  );
}
