import { Skeleton } from "@/components/ui/skeleton";

export function BoardDetailSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b bg-background/95 backdrop-blur flex-shrink-0">
        <div className="p-6">
          <Skeleton className="h-10 w-1/3 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>

      <div className="flex gap-4 p-6 h-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 w-80">
            <div className="flex flex-col h-full">
              <div className="rounded-t-lg p-3 bg-muted/50 mb-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
