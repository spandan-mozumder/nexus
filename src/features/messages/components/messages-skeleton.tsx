"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ChannelListSkeleton() {
  return (
    <div className="w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-background to-muted/10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex-1 p-3">
        {/* Channels Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-7 w-7 rounded" />
          </div>

          <div className="mt-2 space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        <Skeleton className="h-px w-full my-3" />

        {/* Direct Messages Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
          </div>

          <div className="mt-2 space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className={`flex-1 max-w-2xl ${i % 2 === 0 ? "flex flex-col items-end" : ""}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className={`h-16 ${i % 2 === 0 ? "w-48" : "w-64"} rounded-lg`} />
              <div className="flex gap-1 mt-1">
                <Skeleton className="h-5 w-10 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function ChannelHeaderSkeleton() {
  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-4 w-48 mt-1" />
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <MessageItemSkeleton key={i} isOwn={i % 2 === 0} />
      ))}
    </div>
  );
}

export function MessageItemSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className={`flex-1 max-w-2xl ${isOwn ? "flex flex-col items-end" : ""}`}>
        <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-12 w-52 rounded-lg" />
      </div>
    </div>
  );
}

export function ProjectChannelsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
