import { Skeleton } from "@/components/ui/skeleton";

export default function TagsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  {j > 0 && <Skeleton className="h-px w-4" />}
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
