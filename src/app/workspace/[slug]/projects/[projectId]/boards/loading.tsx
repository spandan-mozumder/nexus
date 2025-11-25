import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BoardsLoading() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Boards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-3">
              <Skeleton className="h-20 w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
