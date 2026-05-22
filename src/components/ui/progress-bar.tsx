interface ProgressBarProps {
  value: number // 0-100
  color?: 'emerald' | 'cyan' | 'amber' | 'red' | 'purple'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const barColorMap = {
  emerald: 'bg-emerald-500',
  cyan: 'bg-cyan-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
}

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({ value, color = 'emerald', showLabel = false, size = 'md' }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  // Auto color based on value
  const autoColor = color === 'emerald'
    ? clampedValue >= 80 ? 'emerald' : clampedValue >= 50 ? 'amber' : 'red'
    : color

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-secondary rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`${sizeMap[size]} ${barColorMap[autoColor]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums w-10 text-right flex-shrink-0">
          {clampedValue}%
        </span>
      )}
    </div>
  )
}
