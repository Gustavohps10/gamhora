import { Skeleton } from '@/components/ui/skeleton'

export function TimeEntriesSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
      <div className="rounded-md border">
        <div className="bg-muted/50 border-b p-2">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b p-3 last:border-0"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end pr-4">
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  )
}
