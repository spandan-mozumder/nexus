import { Loader2, MessageSquare } from "lucide-react";

export default function ChannelLoading() {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Channel</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your messages...
          </p>
        </div>
      </div>
    </div>
  );
}
