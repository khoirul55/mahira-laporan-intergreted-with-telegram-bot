import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  color?: 'emerald' | 'cyan' | 'amber' | 'red' | 'purple'
}

const colorMap = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
}

const valueColorMap = {
  emerald: 'text-emerald-400',
  cyan: 'text-cyan-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }: StatCardProps) {
  return (
    <div className="p-4 md:p-6 rounded-xl bg-card border border-border transition-all duration-150 hover:border-border/80">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className={`text-2xl md:text-3xl font-bold mt-1.5 ${valueColorMap[color]}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
            <Icon className="w-4 h-4 md:w-5 md:h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'}`}>
            {trend === 'up' ? '↑ Naik' : trend === 'down' ? '↓ Turun' : '→ Stabil'}
          </span>
        </div>
      )}
    </div>
  )
}
