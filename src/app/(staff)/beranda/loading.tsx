import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-card">
      <div className="flex flex-col items-center gap-2 text-secondary-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm">Memuat data...</p>
      </div>
    </div>
  )
}
