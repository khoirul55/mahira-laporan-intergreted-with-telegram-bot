'use client'

import { useState } from 'react'

interface ProfileClientProps {
  userId: string
  telegramId: string | null
  botUsername: string
}

export function ProfileClient({ userId, telegramId, botUsername }: ProfileClientProps) {
  const [copied, setCopied] = useState(false)

  const linkUrl = `https://t.me/${botUsername}?start=user_${userId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(linkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Telegram Bot
      </h2>

      {telegramId ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Terhubung</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Telegram ID: <code className="bg-secondary px-1.5 py-0.5 rounded">{telegramId}</code>
          </p>
          <p className="text-xs text-muted-foreground">
            Anda akan menerima reminder laporan harian jam 16:00 WIB.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Belum Terhubung</span>
          </div>

          <p className="text-sm text-muted-foreground">
            Hubungkan akun Telegram Anda untuk menerima reminder laporan harian otomatis.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium">Cara menghubungkan:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Klik tombol di bawah untuk membuka bot di Telegram</li>
              <li>Tekan <strong>Start</strong> di Telegram</li>
              <li>Akun otomatis terhubung!</li>
            </ol>
          </div>

          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Hubungkan Telegram
          </a>

          <button
            onClick={handleCopy}
            className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? '✅ Link disalin!' : '📋 Atau salin link manual'}
          </button>
        </div>
      )}
    </div>
  )
}
