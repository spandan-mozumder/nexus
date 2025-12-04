import { Loader2, PenTool } from "lucide-react";

export default function WhiteboardsLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="relative">
          <PenTool className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Whiteboards</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your whiteboards...
          </p>
        </div>
      </div>
    </div>
  );
}
