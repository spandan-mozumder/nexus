import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WhiteboardsLoading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-60" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Whiteboards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden group">
            <div className="aspect-video bg-muted relative">
              <Skeleton className="absolute inset-0" />
            </div>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
