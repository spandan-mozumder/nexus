import { Loader2, LayoutDashboard } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/10">
      <div className="text-center space-y-4">
        <div className="relative">
          <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Workspace</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
