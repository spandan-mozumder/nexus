import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DocumentsLoading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="h-full group">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
