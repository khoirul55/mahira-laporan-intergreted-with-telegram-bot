'use client'

import { AlertCircle, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body className="bg-background text-foreground font-sans min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border text-center shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Kesalahan Fatal Sistem 🚨</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aplikasi mendeteksi gangguan fatal pada sistem. Silakan muat ulang halaman ini.
            </p>
            {error.message && (
              <p className="text-2xs font-mono bg-muted/50 p-2.5 rounded-lg border border-border text-muted-foreground/80 break-all text-left mt-2">
                Detail: {error.message}
              </p>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  )
}
