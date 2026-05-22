'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from './button'

interface AIGenerateButtonProps {
  onClick: () => Promise<void>
  label?: string
  loadingLabel?: string
  size?: 'sm' | 'default'
  fullWidth?: boolean
  variant?: 'default' | 'outline'
}

export function AIGenerateButton({
  onClick,
  label = 'Generate dengan AI',
  loadingLabel = 'Sedang memproses...',
  size = 'default',
  fullWidth = false,
  variant = 'default',
}: AIGenerateButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      size={size}
      className={`
        ${variant === 'default'
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0'
          : 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
        }
        ${fullWidth ? 'w-full' : ''}
        transition-all duration-200
      `}
      variant={variant === 'outline' ? 'outline' : 'default'}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}
