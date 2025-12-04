"use client";

import { Loader2, Hash, MessageSquare, Users } from "lucide-react";

export function ChannelListSkeleton() {
  return (
    <div className="w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col items-center justify-center">
      <div className="text-center space-y-3">
        <div className="relative">
          <Hash className="h-12 w-12 text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading channels...</p>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="text-center space-y-3">
        <div className="relative">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    </div>
  );
}

export function ChannelHeaderSkeleton() {
  return (
    <div className="border-b px-6 py-4 flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    </div>
  );
}

export function MessageItemSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex gap-3 items-center justify-center py-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );
}

export function ProjectChannelsSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="relative">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Channels</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your channels...
          </p>
        </div>
      </div>
    </div>
  );
}
