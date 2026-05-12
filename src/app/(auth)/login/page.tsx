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
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            backgroundColor: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e6e3' }}>Mahira Tour</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e8e6e3', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Selamat datang
        </h1>
        <p style={{ fontSize: 14, color: '#737068', lineHeight: 1.5 }}>
          Masuk menggunakan akun yang telah didaftarkan.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="email"
            style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#b5b3af', marginBottom: 6 }}
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

        <div style={{ marginBottom: 24 }}>
          <label
            htmlFor="password"
            style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#b5b3af', marginBottom: 6 }}
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
          <div style={{
            padding: '10px 12px',
            marginBottom: 16,
            backgroundColor: 'rgba(224,82,82,0.08)',
            border: '1px solid rgba(224,82,82,0.2)',
            borderRadius: 6,
            fontSize: 13,
            color: '#e05252',
          }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
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

      <p style={{ marginTop: 32, fontSize: 12, color: '#444240', textAlign: 'center' }}>
        Sistem internal Mahira Tour · Akses terbatas
      </p>
    </div>
  )
}
