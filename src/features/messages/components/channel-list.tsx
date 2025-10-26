"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceChannels, getWorkspaceConversations } from "../actions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Hash,
  Lock,
  Plus,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { CreateChannelModal } from "./create-channel-modal";
import { cn } from "@/lib/utils";

interface ChannelListProps {
  workspaceId: string;
  currentUserId: string;
}

export function ChannelList({
  workspaceId: workspaceSlug,
  currentUserId,
}: ChannelListProps) {
  const params = useParams();
  const pathname = usePathname();
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);

  const { data: channelsResult } = useQuery({
    queryKey: ["channels", workspaceSlug],
    queryFn: async () => {
      const result = await getWorkspaceChannels(workspaceSlug);
      if (result.error) throw new Error(result.error);
      return { channels: result.data, workspaceId: result.workspaceId };
    },
  });

  const { data: conversationsResult } = useQuery({
    queryKey: ["conversations", workspaceSlug],
    queryFn: async () => {
      const result = await getWorkspaceConversations(workspaceSlug);
      if (result.error) throw new Error(result.error);
      return { conversations: result.data, workspaceId: result.workspaceId };
    },
  });

  const channels = channelsResult?.channels || [];
  const conversations = conversationsResult?.conversations || [];
  const workspaceId = channelsResult?.workspaceId;

  if (!workspaceId) {
    return (
      <div className="w-64 border-r bg-muted/10 flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-background to-muted/10">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Messages
          </h2>
          <Badge variant="secondary" className="text-xs">
            {channels.length + conversations.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {}
          <div className="mb-4">
            <button
              onClick={() => setChannelsExpanded(!channelsExpanded)}
              className="flex items-center justify-between w-full px-2 py-2 hover:bg-muted rounded-lg text-sm font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                {channelsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>Channels</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {channels.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setCreateChannelOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </button>

            {channelsExpanded && (
              <div className="mt-2 space-y-1">
                {channels.map((channel) => {
                  const href = `/workspace/${workspaceId}/messages/channel/${channel.id}`;
                  const isActive = pathname === href;

                  return (
                    <Link key={channel.id} href={href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sm font-normal transition-all border-2 border-transparent",
                          isActive &&
                            "bg-muted border-primary/40 shadow-sm text-primary",
                        )}
                        size="sm"
                      >
                        {channel.isPrivate ? (
                          <Lock className="mr-2 h-4 w-4" />
                        ) : (
                          <Hash className="mr-2 h-4 w-4" />
                        )}
                        <span className="truncate font-medium">
                          {channel.name}
                        </span>
                      </Button>
                    </Link>
                  );
                })}
                {channels.length === 0 && (
                  <div className="px-2 py-3 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      No channels yet
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateChannelOpen(true)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create Channel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {}
          <div>
            <button
              onClick={() => setDmsExpanded(!dmsExpanded)}
              className="flex items-center justify-between w-full px-2 py-2 hover:bg-muted rounded-lg text-sm font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                {dmsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>Direct Messages</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {conversations.length}
                </Badge>
              </div>
            </button>

            {dmsExpanded && (
              <div className="mt-2 space-y-1">
                {conversations.map((conversation) => {
                  const otherMember =
                    conversation.memberOneId === currentUserId
                      ? conversation.memberTwo
                      : conversation.memberOne;
                  const href = `/workspace/${workspaceId}/messages/conversation/${conversation.id}`;
                  const isActive = pathname === href;

                  return (
                    <Link key={conversation.id} href={href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-sm font-normal transition-all border-2 border-transparent",
                          isActive &&
                            "bg-muted border-primary/40 shadow-sm text-primary",
                        )}
                        size="sm"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span className="truncate font-medium">
                          {otherMember.name || otherMember.email}
                        </span>
                      </Button>
                    </Link>
                  );
                })}
                {conversations.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-3 text-center">
                    No conversations yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <CreateChannelModal
        workspaceId={workspaceId}
        open={createChannelOpen}
        onOpenChange={setCreateChannelOpen}
      />
    </div>
  );
}
