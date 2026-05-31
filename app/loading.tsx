import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5">
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full rounded-full" />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
