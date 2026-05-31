import { Skeleton } from "@/components/ui/skeleton";

export default function FundsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Summary banner */}
      <Skeleton className="h-28 w-full rounded-xl mb-6" />

      {/* Fund cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <div className="h-1.5 w-full bg-gray-100" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
