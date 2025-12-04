import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getWorkspaceBySlug } from "@/features/workspaces/actions";
import { getUserProjects } from "@/features/workspaces/actions-nav";
import { WorkspaceNav } from "@/features/workspaces/components/workspace-nav-project";
import { Suspense } from "react";
import { Loader2, LayoutDashboard } from "lucide-react";

function SidebarSkeleton() {
  return (
    <div className="fixed left-0 top-0 h-screen w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col overflow-hidden items-center justify-center">
      <div className="text-center space-y-3">
        <div className="relative">
          <LayoutDashboard className="h-12 w-12 text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
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
