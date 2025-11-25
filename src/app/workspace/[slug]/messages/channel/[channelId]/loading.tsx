import { Skeleton } from "@/components/ui/skeleton";
import { ChannelHeaderSkeleton, ChatSkeleton } from "@/features/messages/components/messages-skeleton";

export default function ChannelLoading() {
  return (
    <div className="flex flex-col h-full">
      <ChannelHeaderSkeleton />
      <ChatSkeleton />
    </div>
  );
}
