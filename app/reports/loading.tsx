import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-5 mb-6">
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-52 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
