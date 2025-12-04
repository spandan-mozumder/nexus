"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceProjects } from "../actions";
import { CreateProjectModal } from "./create-project-modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FolderKanban,
  Users,
  ListTodo,
  TrendingUp,
  ArrowRight,
  Inbox,
  Loader2,
} from "lucide-react";

function ProjectListLoading() {
  return (
    <div className="container mx-auto p-6 lg:p-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <FolderKanban className="h-16 w-16 text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold">Loading Projects</h3>
          <p className="text-muted-foreground text-sm">
            Please wait while we load your projects...
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProjectList() {
  const params = useParams();
  const workspaceSlug = params.slug as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", workspaceSlug],
    queryFn: async () => {
      const result = await getWorkspaceProjects(workspaceSlug);
      if (result.error) throw new Error(result.error);
      return { projects: result.data, workspaceId: result.workspaceId };
    },
  });

  if (isLoading) {
    return <ProjectListLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Inbox className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold">Failed to load projects</h3>
            <p className="text-muted-foreground text-sm">
              Please try refreshing the page
            </p>
          </div>
        </div>
      </div>
    );
  }

  const projects = data?.projects || [];
  const workspaceId = data?.workspaceId;

  if (!workspaceId) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Workspace not found</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FolderKanban className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center space-y-2 max-w-md">
            <h3 className="text-2xl font-bold">No projects yet</h3>
            <p className="text-muted-foreground">
              Create your first project to start tracking issues, planning
              sprints, and managing your team's work.
            </p>
          </div>
          <CreateProjectModal workspaceId={workspaceId} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <Badge variant="secondary" className="font-medium">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your projects and track progress across your team
          </p>
        </div>
        <CreateProjectModal workspaceId={workspaceId} />
      </div>

      <Separator />

      {/* Project Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            href={`/workspace/${workspaceSlug}/projects/${project.id}`}
            className="group animate-fadeInUp"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="h-full border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
                    style={{
                      backgroundColor: project.color || "hsl(var(--primary))",
                    }}
                  >
                    {project.key}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-1.5">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {project.description}
                    </CardDescription>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ListTodo className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Issues</span>
                    </div>
                    <p className="text-xl font-bold">
                      {project._count.issues}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Sprints</span>
                    </div>
                    <p className="text-xl font-bold">
                      {project._count.sprints}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="truncate">
                    Led by {project.createdBy.name || project.createdBy.email}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
