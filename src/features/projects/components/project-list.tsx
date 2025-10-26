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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  FolderKanban,
  Users,
  ListTodo,
  Calendar,
  Plus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export function ProjectList() {
  const params = useParams();
  const workspaceSlug = params.slug as string;

  const { data, isLoading } = useQuery({
    queryKey: ["projects", workspaceSlug],
    queryFn: async () => {
      const result = await getWorkspaceProjects(workspaceSlug);
      if (result.error) throw new Error(result.error);
      return { projects: result.data, workspaceId: result.workspaceId };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const projects = data?.projects || [];
  const workspaceId = data?.workspaceId;

  if (!workspaceId) {
    return <div>Workspace not found</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center min-h-[600px] gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-2xl font-bold">No projects yet</h3>
              <p className="text-muted-foreground text-lg">
                Create your first project to start tracking issues, planning
                sprints, and managing your team's work
              </p>
            </div>
            <CreateProjectModal workspaceId={workspaceId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-6">
        {}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
              <Badge variant="secondary" className="px-3 py-1">
                {projects.length} Active
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage your projects and track progress across your team
            </p>
          </div>
          <CreateProjectModal workspaceId={workspaceId} />
        </div>

        <Separator />

        {}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/workspace/${workspaceSlug}/projects/${project.id}`}
              className="group"
            >
              <Card className="h-full border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{
                        backgroundColor: project.color || "hsl(var(--primary))",
                      }}
                    >
                      {project.key}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
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
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ListTodo className="h-4 w-4" />
                        <span className="text-xs font-medium">Issues</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {project._count.issues}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Sprints</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {project._count.sprints}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Led by {project.createdBy.name || project.createdBy.email}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
