import { Loader2, LayoutGrid } from "lucide-react";

export function BoardsSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
        <div className="relative">
          <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading boards...</p>
      </div>
    </div>
  );
}
