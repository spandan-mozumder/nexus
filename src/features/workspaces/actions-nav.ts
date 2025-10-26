"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

export async function getUserProjects(workspaceSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const getCachedProjects = unstable_cache(
      async (slug: string, userId: string) => {
        const workspace = await db.workspace.findUnique({
          where: { slug },
          select: {
            id: true,
            ownerId: true,
          },
        });

        if (!workspace) {
          return { error: "Workspace not found", data: null };
        }

        const isWorkspaceMember =
          userId === workspace.ownerId ||
          (await db.workspaceMember.findUnique({
            where: {
              workspaceId_userId: {
                workspaceId: workspace.id,
                userId,
              },
            },
          }));

        if (!isWorkspaceMember) {
          return { error: "Not a workspace member", data: null };
        }

        const allProjects = await db.project.findMany({
          where: {
            workspaceId: workspace.id,
          },
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
            isPrivate: true,
            isDefault: true,
            createdAt: true,
            _count: {
              select: {
                boards: true,
                documents: true,
                canvases: true,
                issues: true,
              },
            },
            members: {
              where: {
                userId,
              },
              select: {
                role: true,
              },
            },
          },
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });

        const projects = allProjects.filter((project) => {
          if (project.isPrivate && project.members.length === 0) {
            return false;
          }
          return true;
        });

        return { data: projects, workspaceId: workspace.id, error: null };
      },
      [`projects-${workspaceSlug}`],
      {
        revalidate: 30,
        tags: [`projects-${workspaceSlug}`],
      },
    );

    const result = await getCachedProjects(workspaceSlug, session.user.id);

    if (result.error) {
      return { error: result.error };
    }

    return {
      success: true,
      data: result.data!,
      workspaceId: result.workspaceId,
    };
  } catch (error) {
    console.error("Error getting user projects:", error);
    return { error: "Failed to get projects" };
  }
}
