import { protectRoute } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { ChatInterface } from "@/features/messages/components/chat-interface";
import { ChannelMembersDialog } from "@/features/messages/components/channel-members-dialog";
import { Hash, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChannelPageProps {
  params: Promise<{
    slug: string;
    channelId: string;
  }>;
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const session = await protectRoute();

  const { slug, channelId } = await params;

  const channel = await db.channel.findFirst({
    where: {
      id: channelId,
      workspace: {
        slug: slug,
      },
    },
    include: {
      workspace: {
        select: {
          id: true,
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
      members: {
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  // Auto-join public channels when user visits
  if (channel && !channel.isPrivate && channel.members.length === 0) {
    // Check if user is a workspace member first
    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId: channel.workspace.id,
        userId: session.user.id,
      },
    });

    if (workspaceMember) {
      await db.channelMember.create({
        data: {
          channelId: channel.id,
          userId: session.user.id,
        },
      });
    }
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Channel not found</h3>
          <p className="text-sm text-muted-foreground">
            This channel may have been deleted or you don't have access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {channel.isPrivate ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Hash className="h-5 w-5 text-muted-foreground" />
              )}
              <h2 className="text-lg font-semibold">{channel.name}</h2>
            </div>
            {channel.project && (
              <Badge
                variant="secondary"
                className="gap-1"
                style={{
                  backgroundColor: channel.project.color ? `${channel.project.color}20` : undefined,
                  borderColor: channel.project.color || undefined,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: channel.project.color || undefined }}
                />
                {channel.project.name}
              </Badge>
            )}
            {channel.isPrivate && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {channel._count.members} member{channel._count.members !== 1 ? "s" : ""}
            </Badge>
            <ChannelMembersDialog
              channelId={channelId}
              currentUserId={session.user.id}
            />
          </div>
        </div>
        {channel.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {channel.description}
          </p>
        )}
      </div>

      <ChatInterface
        channelId={channelId}
        workspaceId={channel.workspace.id}
        currentUserId={session.user.id}
      />
    </div>
  );
}
