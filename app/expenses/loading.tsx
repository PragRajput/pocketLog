import { Skeleton } from "@/components/ui/skeleton";

export default function ExpensesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <Skeleton className="h-9 flex-1 min-w-48" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* List */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0">
            <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
