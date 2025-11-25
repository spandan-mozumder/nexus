"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChannelMessages, sendMessage, addReaction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Smile, MoreVertical, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import { getInitials } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChatSkeleton, MessageItemSkeleton } from "./messages-skeleton";

interface ChatInterfaceProps {
  channelId: string;
  workspaceId: string;
  currentUserId: string;
}

const commonEmojis = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "🚀", "✅"];

export function ChatInterface({
  channelId,
  workspaceId,
  currentUserId,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      const result = await getChannelMessages(channelId);
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage({ body, workspaceId, channelId }),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
      } else {
        setMessage("");
        queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
      }
    },
  });

  const reactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      addReaction({ messageId, emoji, workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex flex-col h-full">
      {}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUserId;

            const groupedReactions = msg.reactions.reduce(
              (acc, reaction) => {
                if (!acc[reaction.emoji]) {
                  acc[reaction.emoji] = [];
                }
                acc[reaction.emoji].push(reaction);
                return acc;
              },
              {} as Record<string, typeof msg.reactions>,
            );

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(msg.sender.name || msg.sender.email || "U")}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 ${isOwnMessage ? "items-end" : ""}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {msg.sender.name || msg.sender.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistance(new Date(msg.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </span>
                    {msg.isEdited && (
                      <Badge variant="outline" className="text-xs">
                        edited
                      </Badge>
                    )}
                  </div>

                  <div
                    className={`rounded-lg px-4 py-2 max-w-2xl ${
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  </div>

                  {}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {Object.entries(groupedReactions).map(
                      ([emoji, reactions]) => {
                        const hasReacted = reactions.some(
                          (r) => r.userId === currentUserId,
                        );

                        return (
                          <button
                            key={emoji}
                            onClick={() =>
                              reactionMutation.mutate({
                                messageId: msg.id,
                                emoji,
                              })
                            }
                            className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 hover:bg-muted ${
                              hasReacted ? "bg-primary/10 border-primary" : ""
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-xs">{reactions.length}</span>
                          </button>
                        );
                      },
                    )}

                    {}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-xs px-2 py-0.5 rounded-full border hover:bg-muted">
                          <Smile className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <div className="flex gap-1">
                          {commonEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                reactionMutation.mutate({
                                  messageId: msg.id,
                                  emoji,
                                });
                              }}
                              className="text-lg hover:bg-muted p-1 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {}
                  {msg._count.replies > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto p-1"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span className="text-xs">
                        {msg._count.replies} replies
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-muted/50">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
