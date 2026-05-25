'use client'

import { useState } from 'react'
import { loginAction } from '@/actions/auth'
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
    <div>
      {/* Brand */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Mahira Tour</span>
        </div>
        <h1 className="text-[22px] font-semibold text-foreground tracking-[-0.02em] mb-1.5">
          Selamat datang
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Masuk menggunakan akun yang telah didaftarkan.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-secondary-foreground mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nama@mahiratour.id"
            required
            autoComplete="email"
            className="input-clean"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-secondary-foreground mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="input-clean"
          />
        </div>

        {error && (
          <div className="px-3 py-2.5 mb-4 bg-destructive/10 border border-destructive/20 rounded-md text-[13px] text-destructive">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Memproses...
            </>
          ) : (
            'Masuk'
          )}
        </button>
      </form>

      <p className="mt-8 text-xs text-muted-foreground text-center">
        Sistem internal Mahira Tour · Akses terbatas
      </p>
    </div>
  )
}
