"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(80)
    .regex(
      /^[a-z0-9-]+$/,
      "Name must be lowercase letters, numbers, and hyphens only",
    ),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
  workspaceId: z.string(),
  projectId: z.string().optional(),
});

const updateChannelSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80).optional(),
  description: z.string().optional(),
});

const sendMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty"),
  workspaceId: z.string(),
  channelId: z.string().optional(),
  conversationId: z.string().optional(),
  parentId: z.string().optional(),
});

const updateMessageSchema = z.object({
  id: z.string(),
  body: z.string().min(1, "Message cannot be empty"),
});

const addReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string(),
  workspaceId: z.string(),
});

const createConversationSchema = z.object({
  workspaceId: z.string(),
  memberId: z.string(),
});

const idSchema = z.object({
  id: z.string(),
});

export async function createChannel(data: z.infer<typeof createChannelSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createChannelSchema.parse(data);

    let workspaceId = validatedData.workspaceId;
    if (validatedData.projectId && !workspaceId) {
      const project = await db.project.findFirst({
        where: { id: validatedData.projectId },
        select: { workspaceId: true },
      });
      if (!project) {
        return { error: "Project not found" };
      }
      workspaceId = project.workspaceId;
    }

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "You are not a member of this workspace" };
    }

    const channel = await db.channel.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isPrivate: validatedData.isPrivate,
        workspaceId,
        projectId: validatedData.projectId,
        createdById: session.user.id,
      },
    });

    await db.channelMember.create({
      data: {
        channelId: channel.id,
        userId: session.user.id,
      },
    });

    revalidatePath(`/workspace/${workspaceId}/messages`);

    return { success: true, data: channel };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating channel:", error);
    return { error: "Failed to create channel" };
  }
}

export async function getWorkspaceChannels(workspaceSlug: string) {
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

    const channels = await db.channel.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: channels, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting channels:", error);
    return { error: "Failed to fetch channels" };
  }
}

export async function getProjectChannels(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return { error: "You don't have access to this project" };
    }

    const channels = await db.channel.findMany({
      where: {
        projectId,
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, data: channels };
  } catch (error) {
    console.error("Error getting project channels:", error);
    return { error: "Failed to fetch project channels" };
  }
}

export async function joinChannel(channelId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const channel = await db.channel.findFirst({
      where: { id: channelId },
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

    if (!channel || channel.workspace.members.length === 0) {
      return { error: "Channel not found or access denied" };
    }

    if (channel.isPrivate) {
      return { error: "Cannot join private channel" };
    }

    const existing = await db.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return { error: "Already a member of this channel" };
    }

    await db.channelMember.create({
      data: {
        channelId,
        userId: session.user.id,
      },
    });

    revalidatePath(`/workspace/${channel.workspaceId}/messages`);

    return { success: true };
  } catch (error) {
    console.error("Error joining channel:", error);
    return { error: "Failed to join channel" };
  }
}

export async function leaveChannel(channelId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const channel = await db.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return { error: "Channel not found" };
    }

    await db.channelMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId: session.user.id,
        },
      },
    });

    revalidatePath(`/workspace/${channel.workspaceId}/messages`);

    return { success: true };
  } catch (error) {
    console.error("Error leaving channel:", error);
    return { error: "Failed to leave channel" };
  }
}

export async function sendMessage(data: z.infer<typeof sendMessageSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = sendMessageSchema.parse(data);

    if (validatedData.channelId) {
      const member = await db.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId: validatedData.channelId,
            userId: session.user.id,
          },
        },
      });

      if (!member) {
        return { error: "You are not a member of this channel" };
      }
    }

    const message = await db.message.create({
      data: {
        body: validatedData.body,
        workspaceId: validatedData.workspaceId,
        channelId: validatedData.channelId,
        conversationId: validatedData.conversationId,
        parentId: validatedData.parentId,
        senderId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return { success: true, data: message };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

export async function getChannelMessages(
  channelId: string,
  limit: number = 50,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const member = await db.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return { error: "Access denied" };
    }

    const messages = await db.message.findMany({
      where: {
        channelId,
        parentId: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error getting messages:", error);
    return { error: "Failed to fetch messages" };
  }
}

export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { memberOneId: session.user.id },
          { memberTwoId: session.user.id },
        ],
      },
    });

    if (!conversation) {
      return { error: "Access denied" };
    }

    const messages = await db.message.findMany({
      where: {
        conversationId,
        parentId: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    return { error: "Failed to fetch messages" };
  }
}

export async function updateMessage(data: z.infer<typeof updateMessageSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = updateMessageSchema.parse(data);

    const message = await db.message.findUnique({
      where: { id: validatedData.id },
    });

    if (!message || message.senderId !== session.user.id) {
      return { error: "Message not found or unauthorized" };
    }

    const updated = await db.message.update({
      where: { id: validatedData.id },
      data: {
        body: validatedData.body,
        isEdited: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error updating message:", error);
    return { error: "Failed to update message" };
  }
}

export async function deleteMessage(data: z.infer<typeof idSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = idSchema.parse(data);

    const message = await db.message.findUnique({
      where: { id: validatedData.id },
    });

    if (!message || message.senderId !== session.user.id) {
      return { error: "Message not found or unauthorized" };
    }

    await db.message.delete({
      where: { id: validatedData.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { error: "Failed to delete message" };
  }
}

export async function addReaction(data: z.infer<typeof addReactionSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = addReactionSchema.parse(data);

    const existing = await db.reaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId: validatedData.messageId,
          userId: session.user.id,
          emoji: validatedData.emoji,
        },
      },
    });

    if (existing) {
      await db.reaction.delete({
        where: {
          messageId_userId_emoji: {
            messageId: validatedData.messageId,
            userId: session.user.id,
            emoji: validatedData.emoji,
          },
        },
      });
      return { success: true, removed: true };
    }

    const reaction = await db.reaction.create({
      data: {
        messageId: validatedData.messageId,
        userId: session.user.id,
        emoji: validatedData.emoji,
        workspaceId: validatedData.workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return { success: true, data: reaction };
  } catch (error) {
    console.error("Error adding reaction:", error);
    return { error: "Failed to add reaction" };
  }
}

export async function createOrGetConversation(
  data: z.infer<typeof createConversationSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const validatedData = createConversationSchema.parse(data);

    if (validatedData.memberId === session.user.id) {
      return { error: "Cannot create conversation with yourself" };
    }

    const member = await db.workspaceMember.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        userId: session.user.id,
      },
    });

    if (!member) {
      return { error: "Access denied" };
    }

    const existing = await db.conversation.findFirst({
      where: {
        workspaceId: validatedData.workspaceId,
        OR: [
          {
            memberOneId: session.user.id,
            memberTwoId: validatedData.memberId,
          },
          {
            memberOneId: validatedData.memberId,
            memberTwoId: session.user.id,
          },
        ],
      },
      include: {
        memberOne: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (existing) {
      return { success: true, data: existing };
    }

    const conversation = await db.conversation.create({
      data: {
        workspaceId: validatedData.workspaceId,
        memberOneId: session.user.id,
        memberTwoId: validatedData.memberId,
      },
      include: {
        memberOne: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return { success: true, data: conversation };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Error creating conversation:", error);
    return { error: "Failed to create conversation" };
  }
}

export async function getWorkspaceConversations(workspaceSlug: string) {
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

    const conversations = await db.conversation.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [
          { memberOneId: session.user.id },
          { memberTwoId: session.user.id },
        ],
      },
      include: {
        memberOne: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        memberTwo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: conversations, workspaceId: workspace.id };
  } catch (error) {
    console.error("Error getting conversations:", error);
    return { error: "Failed to fetch conversations" };
  }
}
