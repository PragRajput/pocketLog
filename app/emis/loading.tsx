import { Skeleton } from "@/components/ui/skeleton";

export default function EMIsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-4 w-56" /></div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-2">
            <Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-64" /></div>
              <Skeleton className="h-9 w-28" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex gap-1">{Array.from({ length: 12 }).map((_, j) => <Skeleton key={j} className="h-5 w-5 rounded" />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
