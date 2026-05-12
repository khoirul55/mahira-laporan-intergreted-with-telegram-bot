'use client'

import { useState } from 'react'
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 mb-1">
          <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Mahira Tour</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Sistem Laporan Terintegrasi</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-black/50">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">Masuk ke akun Anda</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Gunakan email dan password yang terdaftar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-foreground/80">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@mahiratour.id"
              required
              autoComplete="email"
              className="h-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-foreground/80">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-200 mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-muted-foreground/50 text-xs">
        © 2026 Mahira Tour. Sistem Internal — Hak akses terbatas.
      </p>
    </div>
  )
}
