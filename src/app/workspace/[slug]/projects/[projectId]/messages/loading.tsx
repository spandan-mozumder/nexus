import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProjectMessagesLoading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Channels Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* About Section Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
