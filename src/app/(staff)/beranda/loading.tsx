import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm">Memuat data...</p>
      </div>
    </div>
  )
}
