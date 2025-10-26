"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify, generateInviteCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { unstable_cache } from "next/cache";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
});

export async function createWorkspace(
  values: z.infer<typeof createWorkspaceSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedFields = createWorkspaceSchema.parse(values);

    let slug = slugify(validatedFields.name);

    const existingWorkspace = await db.workspace.findUnique({
      where: { slug },
    });

    if (existingWorkspace) {
      slug = `${slug}-${Date.now()}`;
    }

    const workspace = await db.$transaction(async (tx) => {
      const newWorkspace = await tx.workspace.create({
        data: {
          name: validatedFields.name,
          slug,
          description: validatedFields.description,
          inviteCode: generateInviteCode(),
          ownerId: session.user.id,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
      });

      const defaultProject = await tx.project.create({
        data: {
          name: "Private",
          key: "PRIV",
          description:
            "Your personal workspace for private boards, documents, and whiteboards",
          workspaceId: newWorkspace.id,
          createdById: session.user.id,
          isPrivate: true,
          isDefault: true,
          color: "#6366f1",
          members: {
            create: {
              userId: session.user.id,
              role: "ADMIN",
            },
          },
        },
      });

      const defaultChannel = await tx.channel.create({
        data: {
          name: `${defaultProject.key.toLowerCase()}-general`,
          description: `General discussion for ${defaultProject.name}`,
          workspaceId: newWorkspace.id,
          projectId: defaultProject.id,
          createdById: session.user.id,
        },
      });

      await tx.channelMember.create({
        data: {
          channelId: defaultChannel.id,
          userId: session.user.id,
        },
      });

      return newWorkspace;
    });

    revalidatePath("/dashboard");
    return { success: true, workspace };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Failed to create workspace" };
  }
}

export async function getUserWorkspaces() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, workspaces };
  } catch (error) {
    return { error: "Failed to fetch workspaces" };
  }
}

export async function getWorkspaceBySlug(slug: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const getCachedWorkspace = unstable_cache(
      async (workspaceSlug: string, userId: string) => {
        const workspace = await db.workspace.findUnique({
          where: { slug: workspaceSlug },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            inviteCode: true,
            ownerId: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            members: {
              select: {
                id: true,
                role: true,
                userId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        });

        if (!workspace) {
          return null;
        }

        const isMember = workspace.members.some((m) => m.userId === userId);
        if (!isMember) {
          return null;
        }

        return workspace;
      },
      [`workspace-${slug}`],
      {
        revalidate: 60,
        tags: [`workspace-${slug}`],
      },
    );

    const workspace = await getCachedWorkspace(slug, session.user.id);

    if (!workspace) {
      return { error: "Workspace not found or access denied" };
    }

    return { success: true, workspace };
  } catch (error) {
    return { error: "Failed to fetch workspace" };
  }
}
