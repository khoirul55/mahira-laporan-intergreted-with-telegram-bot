'use client'

import { useState, useEffect } from 'react'
import { getAnalyticsData, getAIInsight } from '@/actions/analytics'
import { StatCard } from '@/components/ui/stat-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { AIGenerateButton } from '@/components/ui/ai-generate-button'
import { Users, TrendingUp, BarChart2, Star, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

interface LeaderboardItem {
  name: string
  division: string
  rate: number
}

interface DivisionStat {
  name: string
  rate: number
  staffCount: number
}

interface WeeklyTrendItem {
  label: string
  rate: number
}

interface AnalyticsState {
  avgCompletionRate: number
  leaderboard: LeaderboardItem[]
  divisionStats: DivisionStat[]
  weeklyTrend: WeeklyTrendItem[]
  totalStaff: number
}

export default function AnalyticsDashboardPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<AnalyticsState | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiInsight, setAiInsight] = useState('')
  const [generatingAI, setGeneratingAI] = useState(false)

  useEffect(() => {
    loadAnalytics()
    setAiInsight('')
  }, [month, year])

  async function loadAnalytics() {
    setLoading(true)
    const res = await getAnalyticsData(month, year)
    if ('error' in res) {
      toast.error(res.error)
      setData(null)
    } else {
      setData(res as AnalyticsState)
    }
    setLoading(false)
  }

  async function handleGenerateInsight() {
    setGeneratingAI(true)
    const res = await getAIInsight(month, year)
    if ('error' in res) {
      toast.error(res.error)
    } else {
      setAiInsight(res.insight || 'Tidak ada insight yang dapat di-generate.')
      toast.success('AI Insight berhasil dibuat!')
    }
    setGeneratingAI(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-10 pb-12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Analisis & Performa Laporan 📈</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau statistik kepatuhan dan performa pengiriman laporan harian staff
        </p>
      </div>

      {/* Month/Year Selection */}
      <div className="flex gap-3 mb-6 max-w-sm">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="flex-1 h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {[2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 rounded-xl bg-card animate-pulse" />
            <div className="h-28 rounded-xl bg-card animate-pulse" />
          </div>
          <div className="h-64 rounded-xl bg-card animate-pulse" />
        </div>
      ) : !data ? (
        <div className="p-12 text-center rounded-xl bg-card border border-border">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Tidak ada data untuk periode ini.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard title="Total Staff" value={data.totalStaff} icon={Users} color="cyan" />
            <StatCard
              title="Rata-rata Completion Rate"
              value={`${data.avgCompletionRate}%`}
              icon={TrendingUp}
              color={data.avgCompletionRate >= 80 ? 'emerald' : data.avgCompletionRate >= 50 ? 'amber' : 'red'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Trend & Leaderboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Weekly Trend (Bar Chart CSS) */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Tren Mingguan</h3>
                <div className="space-y-4">
                  {data.weeklyTrend.map((trend, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">{trend.label}</span>
                        <span className="font-bold text-foreground">{trend.rate}%</span>
                      </div>
                      <div className="h-6 w-full bg-muted rounded-md overflow-hidden relative border border-border/20">
                        <div
                          className={`h-full transition-all duration-500 rounded-r-md ${
                            trend.rate >= 80
                              ? 'bg-gradient-to-r from-emerald-500/60 to-emerald-500'
                              : trend.rate >= 50
                              ? 'bg-gradient-to-r from-amber-500/60 to-amber-500'
                              : 'bg-gradient-to-r from-red-500/60 to-red-500'
                          }`}
                          style={{ width: `${Math.max(4, trend.rate)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-amber-400" /> Keaktifan Staff
                </h3>
                {data.leaderboard.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">Belum ada staff mengisi laporan bulanan.</p>
                ) : (
                  <div className="space-y-3">
                    {data.leaderboard.map((staff, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{staff.name}</p>
                            <p className="text-2xs text-muted-foreground">{staff.division}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          staff.rate >= 80
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : staff.rate >= 50
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {staff.rate}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Divisi & AI Insight */}
            <div className="space-y-6">
              {/* Division Stats */}
              <div className="p-5 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Statistik Per Divisi</h3>
                {data.divisionStats.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">Belum ada data divisi.</p>
                ) : (
                  <div className="space-y-4">
                    {data.divisionStats.map((div, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">{div.name}</span>
                          <span className="text-muted-foreground">{div.staffCount} Staff &bull; {div.rate}%</span>
                        </div>
                        <ProgressBar value={div.rate} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Insight Box */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/[0.03] to-cyan-500/[0.03] border border-emerald-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl" />
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> Analisis AI Gemini
                </h3>

                {aiInsight ? (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-lg bg-background/50 border border-emerald-500/10 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {aiInsight}
                    </div>
                    <AIGenerateButton
                      onClick={handleGenerateInsight}
                      label="Re-generate Insight AI"
                      size="sm"
                    />
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Dapatkan ringkasan performa, area yang butuh perhatian, dan rekomendasi langkah taktis langsung dari AI.
                    </p>
                    <AIGenerateButton
                      onClick={handleGenerateInsight}
                      label="Generate AI Insight"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
