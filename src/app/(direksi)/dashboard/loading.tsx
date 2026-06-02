import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-64 bg-muted" />
        <Skeleton className="h-4 w-48 bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-border space-y-4 bg-card">
            <Skeleton className="h-4 w-32 bg-muted" />
            <Skeleton className="h-8 w-16 bg-muted" />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-12 w-full bg-muted" />
        <Skeleton className="h-[200px] w-full bg-muted" />
      </div>
    </div>
  )
}
