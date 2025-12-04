"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChannelMessages, sendMessage, addReaction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Smile, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChatSkeleton } from "./messages-skeleton";

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
  const inputRef = useRef<HTMLInputElement>(null);
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
        inputRef.current?.focus();
      }
    },
    onError: () => {
      toast.error("Failed to send message");
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
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === currentUserId;
            const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;

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
                className={cn(
                  "flex gap-3 group animate-fadeIn",
                  isOwnMessage && "flex-row-reverse"
                )}
              >
                {showAvatar ? (
                  <Avatar className="h-8 w-8 shrink-0 border">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(msg.sender.name || msg.sender.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 shrink-0" />
                )}

                <div className={cn("flex-1 max-w-[75%]", isOwnMessage && "flex flex-col items-end")}>
                  {showAvatar && (
                    <div className={cn("flex items-baseline gap-2 mb-1", isOwnMessage && "flex-row-reverse")}>
                      <span className="font-medium text-sm">
                        {msg.sender.name || msg.sender.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistance(new Date(msg.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                      {msg.isEdited && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          edited
                        </Badge>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 shadow-sm",
                      isOwnMessage
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                  </div>

                  {/* Reactions */}
                  <div className={cn("flex gap-1 mt-1.5 flex-wrap", isOwnMessage && "justify-end")}>
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
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors hover:bg-accent",
                              hasReacted && "bg-primary/10 border-primary/30"
                            )}
                          >
                            <span>{emoji}</span>
                            <span className="text-xs font-medium">{reactions.length}</span>
                          </button>
                        );
                      },
                    )}

                    {/* Add reaction button */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-xs px-2 py-0.5 rounded-full border hover:bg-accent transition-colors opacity-0 group-hover:opacity-100">
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
                              className="text-lg hover:bg-accent p-1.5 rounded-md transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Replies indicator */}
                  {msg._count.replies > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {msg._count.replies} {msg._count.replies === 1 ? 'reply' : 'replies'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No messages yet</p>
                  <p className="text-sm">Be the first to start the conversation!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-11"
            disabled={sendMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0"
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
