'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StaffError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Terjadi Kesalahan ⚠️</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sistem gagal memuat halaman ini. Silakan coba memuat ulang atau kembali ke beranda.
          </p>
          {error.message && (
            <p className="text-2xs font-mono bg-muted/50 p-2.5 rounded-lg border border-border text-muted-foreground/80 break-all text-left mt-2">
              Detail: {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            onClick={() => reset()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <a
            href="/beranda"
            className="w-full inline-flex items-center justify-center h-10 rounded-lg border border-border bg-transparent text-sm font-medium hover:bg-secondary transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  )
}
