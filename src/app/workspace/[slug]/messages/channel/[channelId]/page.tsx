import { protectRoute } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { ChatInterface } from "@/features/messages/components/chat-interface";
import { Hash, Lock } from "lucide-react";

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
      workspaceId: slug,
    },
  });

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          {channel.isPrivate ? (
            <Lock className="h-5 w-5" />
          ) : (
            <Hash className="h-5 w-5" />
          )}
          <h2 className="text-lg font-semibold">{channel.name}</h2>
        </div>
        {channel.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {channel.description}
          </p>
        )}
      </div>

      <ChatInterface
        channelId={channelId}
        workspaceId={slug}
        currentUserId={session.user.id}
      />
    </div>
  );
}
