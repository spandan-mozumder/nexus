"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getWorkspaceIssues(workspaceSlug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const workspace = await db.workspace.findUnique({
      where: { slug: workspaceSlug },
      select: { id: true },
    });

    if (!workspace) {
      return { error: "Workspace not found" };
    }

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId: workspace.id,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "You are not a member of this workspace" };
    }

    const issues = await db.issue.findMany({
      where: {
        workspaceId: workspace.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, data: issues, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting workspace issues:", error);
    return { error: "Failed to fetch issues" };
  }
}
