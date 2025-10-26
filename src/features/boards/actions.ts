"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  workspaceId: z.string(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
});

const updateBoardSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
});

const createListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  boardId: z.string(),
});

const updateListSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  position: z.number().optional(),
});

const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  listId: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateCardSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  position: z.number().optional(),
  listId: z.string().optional(),
  dueDate: z.string().optional(),
});

const idSchema = z.object({
  id: z.string(),
});

export async function createBoard(data: z.infer<typeof createBoardSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createBoardSchema.parse(data);

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "You are not a member of this workspace" };
    }

    let projectId = validatedData.projectId;
    if (!projectId) {
      const defaultProject = await db.project.findFirst({
        where: {
          workspaceId: validatedData.workspaceId,
          isDefault: true,
        },
      });

      if (!defaultProject) {
        return { error: "No default project found in workspace" };
      }

      projectId = defaultProject.id;
    }

    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return { error: "You don't have access to this project" };
    }

    const board = await db.board.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        workspaceId: validatedData.workspaceId,
        projectId: projectId,
        backgroundColor: validatedData.backgroundColor || "#0079BF",
      },
    });

    await db.activityLog.create({
      data: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
        action: "CREATED",
        entityType: "BOARD",
        entityId: board.id,
        metadata: { message: `Created board "${board.title}"` },
      },
    });

    revalidatePath(`/workspace/${validatedData.workspaceId}/boards`);

    return { success: true, data: board };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating board:", error);
    return { error: "Failed to create board" };
  }
}

export async function updateBoard(data: z.infer<typeof updateBoardSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateBoardSchema.parse(data);

    const board = await db.board.findFirst({
      where: { id: validatedData.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    });

    if (!board || board.workspace.members.length === 0) {
      return { error: "Board not found or access denied" };
    }

    const { id, ...updateData } = validatedData;
    const updatedBoard = await db.board.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    revalidatePath(`/workspace/${board.workspaceId}/boards`);
    revalidatePath(
      `/workspace/${board.workspaceId}/boards/${validatedData.id}`,
    );

    return { success: true, data: updatedBoard };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating board:", error);
    return { error: "Failed to update board" };
  }
}

export async function deleteBoard(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const board = await db.board.findFirst({
      where: { id: validatedData.id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        project: true,
      },
    });

    if (!board || board.workspace.members.length === 0) {
      return { error: "Board not found or access denied" };
    }

    if (board.project && board.project.createdById !== session.user.id) {
      return { error: "Only the project creator can delete boards" };
    }

    await db.board.delete({
      where: { id: validatedData.id },
    });

    await db.activityLog.create({
      data: {
        workspaceId: board.workspaceId,
        userId: session.user.id,
        action: "DELETED",
        entityType: "BOARD",
        entityId: board.id,
        metadata: { message: `Deleted board "${board.title}"` },
      },
    });

    revalidatePath(`/workspace/${board.workspaceId}/boards`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting board:", error);
    return { error: "Failed to delete board" };
  }
}

export async function getWorkspaceBoards(workspaceSlug: string) {
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
      return { error: "Access denied" };
    }

    const boards = await db.board.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    return { success: true, data: boards, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting boards:", error);
    return { error: "Failed to fetch boards" };
  }
}

export async function getProjectBoards(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const projectMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: session.user.id,
        },
      },
    });

    if (!projectMember) {
      return { error: "Access denied" };
    }

    const boards = await db.board.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        backgroundColor: true,
        createdAt: true,
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    return { success: true, data: boards };
  } catch (error) {
    console.error("Error getting project boards:", error);
    return { error: "Failed to fetch project boards" };
  }
}

export async function getBoardById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const board = await db.board.findFirst({
      where: { id },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              orderBy: { position: "asc" },
              include: {
                assignees: {
                  include: {
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
            },
          },
        },
      },
    });

    if (!board || board.workspace.members.length === 0) {
      return { error: "Board not found or access denied" };
    }

    return { success: true, data: board };
  } catch (error) {
    console.error("Error getting board:", error);
    return { error: "Failed to fetch board" };
  }
}

export async function createList(data: z.infer<typeof createListSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createListSchema.parse(data);

    const board = await db.board.findFirst({
      where: { id: validatedData.boardId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
        lists: true,
      },
    });

    if (!board || board.workspace.members.length === 0) {
      return { error: "Board not found or access denied" };
    }

    const maxPosition = board.lists.reduce(
      (max, list) => Math.max(max, list.position),
      0,
    );

    const list = await db.list.create({
      data: {
        title: validatedData.title,
        boardId: validatedData.boardId,
        position: maxPosition + 1,
      },
    });

    revalidatePath(
      `/workspace/${board.workspaceId}/boards/${validatedData.boardId}`,
    );

    return { success: true, data: list };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating list:", error);
    return { error: "Failed to create list" };
  }
}

export async function updateList(data: z.infer<typeof updateListSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateListSchema.parse(data);

    const list = await db.list.findFirst({
      where: { id: validatedData.id },
      include: {
        board: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
      },
    });

    if (!list || list.board.workspace.members.length === 0) {
      return { error: "List not found or access denied" };
    }

    const { id, ...updateData } = validatedData;
    const updatedList = await db.list.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    revalidatePath(
      `/workspace/${list.board.workspaceId}/boards/${list.boardId}`,
    );

    return { success: true, data: updatedList };
  } catch (error) {
    console.error("Error updating list:", error);
    return { error: "Failed to update list" };
  }
}

export async function deleteList(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const list = await db.list.findFirst({
      where: { id: validatedData.id },
      include: {
        board: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
            project: true,
          },
        },
      },
    });

    if (!list || list.board.workspace.members.length === 0) {
      return { error: "List not found or access denied" };
    }

    if (
      list.board.project &&
      list.board.project.createdById !== session.user.id
    ) {
      return { error: "Only the project creator can delete lists" };
    }

    await db.list.delete({
      where: { id: validatedData.id },
    });

    revalidatePath(
      `/workspace/${list.board.workspaceId}/boards/${list.boardId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting list:", error);
    return { error: "Failed to delete list" };
  }
}

export async function createCard(data: z.infer<typeof createCardSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createCardSchema.parse(data);

    const list = await db.list.findFirst({
      where: { id: validatedData.listId },
      include: {
        board: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
        cards: true,
      },
    });

    if (!list || list.board.workspace.members.length === 0) {
      return { error: "List not found or access denied" };
    }

    const maxPosition = list.cards.reduce(
      (max, card) => Math.max(max, card.position),
      0,
    );

    const card = await db.card.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        listId: validatedData.listId,
        position: maxPosition + 1,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
    });

    revalidatePath(
      `/workspace/${list.board.workspaceId}/boards/${list.boardId}`,
    );

    return { success: true, data: card };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating card:", error);
    return { error: "Failed to create card" };
  }
}

export async function updateCard(data: z.infer<typeof updateCardSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateCardSchema.parse(data);

    const card = await db.card.findFirst({
      where: { id: validatedData.id },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: {
                  include: {
                    members: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!card || card.list.board.workspace.members.length === 0) {
      return { error: "Card not found or access denied" };
    }

    const { id, ...updateData } = validatedData;

    const dataToUpdate: any = { ...updateData };
    if (updateData.dueDate) {
      dataToUpdate.dueDate = new Date(updateData.dueDate);
    }

    const updatedCard = await db.card.update({
      where: { id: validatedData.id },
      data: dataToUpdate,
    });

    revalidatePath(
      `/workspace/${card.list.board.workspaceId}/boards/${card.list.boardId}`,
    );

    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error updating card:", error);
    return { error: "Failed to update card" };
  }
}

export async function deleteCard(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const card = await db.card.findFirst({
      where: { id: validatedData.id },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: {
                  include: {
                    members: {
                      where: { userId: session.user.id },
                    },
                  },
                },
                project: true,
              },
            },
          },
        },
      },
    });

    if (!card || card.list.board.workspace.members.length === 0) {
      return { error: "Card not found or access denied" };
    }

    if (
      card.list.board.project &&
      card.list.board.project.createdById !== session.user.id
    ) {
      return { error: "Only the project creator can delete cards" };
    }

    await db.card.delete({
      where: { id: validatedData.id },
    });

    revalidatePath(
      `/workspace/${card.list.board.workspaceId}/boards/${card.list.boardId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { error: "Failed to delete card" };
  }
}

export async function moveCard(data: {
  cardId: string;
  destinationListId: string;
  destinationPosition: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const { cardId, destinationListId, destinationPosition } = data;

    const card = await db.card.findFirst({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: {
                  include: {
                    members: {
                      where: { userId: session.user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!card || card.list.board.workspace.members.length === 0) {
      return { error: "Card not found or access denied" };
    }

    await db.card.update({
      where: { id: cardId },
      data: {
        listId: destinationListId,
        position: destinationPosition,
      },
    });

    revalidatePath(
      `/workspace/${card.list.board.workspaceId}/boards/${card.list.boardId}`,
    );

    return { success: true };
  } catch (error) {
    console.error("Error moving card:", error);
    return { error: "Failed to move card" };
  }
}
