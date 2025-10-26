import { protectRoute } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { getProjectById } from "@/features/projects/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { ProjectTabs } from "./project-tabs";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
    projectId: string;
  }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  await protectRoute();

  const { slug, projectId } = await params;
  const projectResult = await getProjectById(projectId);

  if (projectResult.error || !projectResult.data) {
    redirect(`/workspace/${slug}/projects`);
  }

  const project = projectResult.data;

  return (
    <div className="flex-1 flex flex-col">
      {}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 py-4">
          <Link href={`/workspace/${slug}`}>
            <Button variant="ghost" size="sm" className="mb-3">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspace
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ backgroundColor: project.color || "#6366f1" }}
            >
              {project.key}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {project.name}
                </h1>
                {project.isPrivate && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
                {project.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {}
        <ProjectTabs workspaceSlug={slug} projectId={projectId} />
      </div>

      {}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
