import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceLoading() {
  return (
    <div className="flex min-h-screen">
      {}
      <div className="fixed left-0 top-0 h-screen w-72 border-r bg-gradient-to-br from-background to-muted/20 flex flex-col overflow-hidden">
        {}
        <div className="p-4 border-b space-y-3 flex-shrink-0">
          <Skeleton className="h-9 w-full" />
          <div className="px-2 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {}
        <div className="p-3 border-b flex-shrink-0">
          <Skeleton className="h-9 w-full" />
        </div>

        {}
        <div className="flex-1 p-3 space-y-2">
          <Skeleton className="h-5 w-20 mb-3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {}
        <div className="p-3 border-t flex-shrink-0">
          <Skeleton className="h-9 w-full" />
        </div>

        {}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </div>

      {}
      <main className="flex-1 ml-72 p-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    </div>
  );
}
