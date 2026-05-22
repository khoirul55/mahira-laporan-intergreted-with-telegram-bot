import { getMonthlyReportById } from '@/actions/monthly-report'
import { StatCard } from '@/components/ui/stat-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { CalendarDays, FileCheck, Clock, UserX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

interface AutoData {
  totalWorkDays: number
  totalSubmitted: number
  totalAbsences: number
  completionRate: number
  taskBreakdown: { selesai: number; dalam_proses: number; tidak_selesai: number; dibatalkan: number }
}

interface MonthlyReportData {
  id: number
  status: string
  month: number
  year: number
  achievements: string | null
  challenges: string | null
  next_month_plan: string | null
  auto_generated_data: AutoData | null
  submitted_at: string | null
  users: { full_name: string } | null
  divisions: { name: string } | null
}

export default async function MonthlyReportDetailPage({ params }: { params: { id: string } }) {
  const reportId = parseInt(params.id, 10)
  if (isNaN(reportId)) {
    notFound()
  }

  const { data, error } = await getMonthlyReportById(reportId)
  if (error || !data) {
    notFound()
  }

  const report = data as unknown as MonthlyReportData
  const autoData = report.auto_generated_data
  const isSubmitted = report.status === 'submitted'

  return (
    <div className="p-4 md:p-6 lg:p-10 pb-12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/dashboard/laporan-bulanan"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Laporan Bulanan: {report.users?.full_name || 'Staff'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Divisi: <span className="text-cyan-400 font-semibold">{report.divisions?.name || '-'}</span> &bull; Periode: <span className="text-foreground font-medium">{MONTH_NAMES[report.month]} {report.year}</span>
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isSubmitted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {isSubmitted ? '✅ Submitted' : '📝 Draft'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Grid */}
          {autoData && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard title="Hari Kerja" value={autoData.totalWorkDays} icon={CalendarDays} color="cyan" />
              <StatCard title="Disubmit" value={autoData.totalSubmitted} icon={FileCheck} color="emerald" />
              <StatCard title="Izin" value={autoData.totalAbsences} icon={UserX} color="amber" />
              <StatCard
                title="Completion"
                value={`${autoData.completionRate}%`}
                icon={Clock}
                color={autoData.completionRate >= 80 ? 'emerald' : autoData.completionRate >= 50 ? 'amber' : 'red'}
              />
            </div>
          )}

          {/* Completion Progress & Task Breakdown */}
          {autoData && (
            <div className="p-5 rounded-xl bg-card border border-border">
              <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-2">COMPLETION RATE</p>
              <ProgressBar value={autoData.completionRate} showLabel size="lg" />

              <div className="mt-6 pt-4 border-t border-border/60">
                <p className="text-xs font-semibold text-muted-foreground tracking-wider mb-3">BREAKDOWN TUGAS HARI INI</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <p className="text-lg font-bold text-emerald-400">{autoData.taskBreakdown.selesai}</p>
                    <p className="text-2xs text-muted-foreground">Selesai</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-center">
                    <p className="text-lg font-bold text-cyan-400">{autoData.taskBreakdown.dalam_proses}</p>
                    <p className="text-2xs text-muted-foreground">Dalam Proses</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                    <p className="text-lg font-bold text-amber-400">{autoData.taskBreakdown.tidak_selesai}</p>
                    <p className="text-2xs text-muted-foreground">Tidak Selesai</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
                    <p className="text-lg font-bold text-red-400">{autoData.taskBreakdown.dibatalkan}</p>
                    <p className="text-2xs text-muted-foreground">Dibatalkan</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Narratives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <span className="text-lg">🏆</span> Pencapaian Utama
            </h3>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/40 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {report.achievements || <span className="text-muted-foreground italic">Belum ada data pencapaian.</span>}
            </div>
          </div>

          {/* Challenges */}
          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <span className="text-lg">⚡</span> Tantangan & Kendala
            </h3>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/40 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {report.challenges || <span className="text-muted-foreground italic">Belum ada data tantangan.</span>}
            </div>
          </div>

          {/* Next Month Plan */}
          <div className="p-5 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <span className="text-lg">📋</span> Rencana Bulan Depan
            </h3>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/40 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {report.next_month_plan || <span className="text-muted-foreground italic">Belum ada rencana yang didokumentasikan.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
