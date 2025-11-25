import { Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center space-y-4">
        <div className="relative">
          <Hash className="h-16 w-16 mx-auto opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Messages</h3>
          <p className="text-sm">
            Please wait while we load your channels...
          </p>
        </div>
      </div>
    </div>
  );
}
