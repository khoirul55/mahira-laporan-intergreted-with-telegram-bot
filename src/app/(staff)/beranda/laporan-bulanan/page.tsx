'use client'

import { useState, useEffect } from 'react'
import { generateMonthlyReport, getMyMonthlyReport, updateMonthlyNarrative, submitMonthlyReport } from '@/actions/monthly-report'
import { StatCard } from '@/components/ui/stat-card'
import { ProgressBar } from '@/components/ui/progress-bar'
import { AIGenerateButton } from '@/components/ui/ai-generate-button'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CalendarDays, FileCheck, Clock, UserX, Send, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

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
  achievements: string | null
  challenges: string | null
  next_month_plan: string | null
  auto_generated_data: AutoData | null
  submitted_at: string | null
}

export default function LaporanBulananPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [report, setReport] = useState<MonthlyReportData | null>(null)
  const [achievements, setAchievements] = useState('')
  const [challenges, setChallenges] = useState('')
  const [nextPlan, setNextPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    loadReport()
  }, [month, year])

  async function loadReport() {
    setLoading(true)
    const res = await getMyMonthlyReport(month, year)
    if (res.data) {
      const d = res.data as MonthlyReportData
      setReport(d)
      setAchievements(d.achievements || '')
      setChallenges(d.challenges || '')
      setNextPlan(d.next_month_plan || '')
    } else {
      setReport(null)
      setAchievements('')
      setChallenges('')
      setNextPlan('')
    }
    setLoading(false)
  }

  async function handleGenerate() {
    const res = await generateMonthlyReport(month, year)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Recap berhasil di-generate!')
    await loadReport()
  }

  async function handleSave() {
    if (!report) return
    setSaving(true)
    const res = await updateMonthlyNarrative(report.id, {
      achievements: achievements || undefined,
      challenges: challenges || undefined,
      next_month_plan: nextPlan || undefined,
    })
    if (res.error) toast.error(res.error)
    else toast.success('Narasi tersimpan')
    setSaving(false)
  }

  async function handleSubmit() {
    if (!report) return
    setShowConfirm(true)
  }

  async function handleConfirmSubmit() {
    if (!report) return
    setSubmitting(true)
    const res = await submitMonthlyReport(report.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success('Laporan bulanan berhasil disubmit!')
      await loadReport()
    }
    setSubmitting(false)
  }

  const autoData = report?.auto_generated_data
  const isSubmitted = report?.status === 'submitted'

  return (
    <div className="p-4 md:p-6 lg:p-10 pb-28 md:pb-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link href="/beranda" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">Laporan Bulanan 📊</h1>
        <p className="text-sm text-muted-foreground mt-1">Rekap otomatis + narasi AI dari laporan harian Anda</p>
      </div>

      {/* Month/Year Picker */}
      <div className="flex gap-3 mb-6">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="flex-1 h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-24 h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          {[2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Status Badge */}
          {report && (
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isSubmitted
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {isSubmitted ? '✅ Submitted' : '📝 Draft'}
              </span>
            </div>
          )}

          {/* Stats Cards */}
          {autoData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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

          {autoData && (
            <div className="mb-6 p-4 rounded-xl bg-card border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">COMPLETION RATE</p>
              <ProgressBar value={autoData.completionRate} showLabel size="lg" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="text-center p-2">
                  <p className="text-lg font-bold text-emerald-400">{autoData.taskBreakdown.selesai}</p>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                </div>
                <div className="text-center p-2">
                  <p className="text-lg font-bold text-cyan-400">{autoData.taskBreakdown.dalam_proses}</p>
                  <p className="text-xs text-muted-foreground">Dalam Proses</p>
                </div>
                <div className="text-center p-2">
                  <p className="text-lg font-bold text-amber-400">{autoData.taskBreakdown.tidak_selesai}</p>
                  <p className="text-xs text-muted-foreground">Tidak Selesai</p>
                </div>
                <div className="text-center p-2">
                  <p className="text-lg font-bold text-red-400">{autoData.taskBreakdown.dibatalkan}</p>
                  <p className="text-xs text-muted-foreground">Dibatalkan</p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {!isSubmitted && (
            <div className="mb-6">
              <AIGenerateButton
                onClick={handleGenerate}
                label={report ? 'Re-generate Recap AI' : 'Generate Recap dengan AI'}
                fullWidth
              />
            </div>
          )}

          {/* Narrative Form */}
          {report && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">🏆 Pencapaian</label>
                <Textarea
                  value={achievements}
                  onChange={e => setAchievements(e.target.value)}
                  placeholder="Pencapaian utama bulan ini..."
                  disabled={isSubmitted}
                  className="min-h-[100px] bg-card border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">⚡ Tantangan</label>
                <Textarea
                  value={challenges}
                  onChange={e => setChallenges(e.target.value)}
                  placeholder="Tantangan yang dihadapi..."
                  disabled={isSubmitted}
                  className="min-h-[100px] bg-card border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">📋 Rencana Bulan Depan</label>
                <Textarea
                  value={nextPlan}
                  onChange={e => setNextPlan(e.target.value)}
                  placeholder="Rencana dan target bulan depan..."
                  disabled={isSubmitted}
                  className="min-h-[100px] bg-card border-border"
                />
              </div>

              {!isSubmitted && (
                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    variant="outline"
                    className="w-full md:w-auto border-border"
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Simpan Draft
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !achievements}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Submit Laporan
                  </Button>
                </div>
              )}
            </div>
          )}

          <ConfirmDialog
            open={showConfirm}
            onOpenChange={setShowConfirm}
            title="Konfirmasi Submit Laporan Bulanan"
            description="Apakah Anda yakin data laporan bulanan sudah final? Setelah disubmit, laporan ini tidak dapat direvisi kembali."
            onConfirm={handleConfirmSubmit}
            variant="default"
            confirmText="Ya, Submit Laporan"
          />
        </>
      )}
    </div>
  )
}
