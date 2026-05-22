'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllMonthlyReports } from '@/actions/monthly-report'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Badge } from '@/components/ui/badge'

const MONTH_NAMES = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

interface MonthlyReport {
  id: number
  month: number
  year: number
  status: string
  submitted_at: string | null
  auto_generated_data: { completionRate: number } | null
  users: { full_name: string } | null
  divisions: { name: string } | null
}

export default function MonthlyListClient({
  initialReports,
  divisions,
}: {
  initialReports: MonthlyReport[]
  divisions: { id: number; name: string }[]
}) {
  const router = useRouter()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [divisionId, setDivisionId] = useState<number | undefined>()
  const [reports, setReports] = useState(initialReports)
  const [loading, setLoading] = useState(false)

  async function handleFilter() {
    setLoading(true)
    const res = await getAllMonthlyReports(month, year, divisionId)
    setReports((res.data || []) as MonthlyReport[])
    setLoading(false)
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={month}
          onChange={e => { setMonth(Number(e.target.value)); }}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => { setYear(Number(e.target.value)); }}
          className="w-24 h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={divisionId || ''}
          onChange={e => setDivisionId(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground"
        >
          <option value="">Semua Divisi</option>
          {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <button
          onClick={handleFilter}
          disabled={loading}
          className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
        >
          {loading ? 'Loading...' : 'Filter'}
        </button>
      </div>

      {/* Mobile: Card List */}
      <div className="md:hidden space-y-3">
        {reports.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">Belum ada laporan bulanan untuk periode ini</p>
        ) : (
          reports.map(r => (
            <div
              key={r.id}
              onClick={() => router.push(`/dashboard/laporan-bulanan/${r.id}`)}
              className="p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm text-foreground">{r.users?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.divisions?.name}</p>
                </div>
                <Badge variant={r.status === 'submitted' ? 'default' : 'secondary'} className={
                  r.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''
                }>
                  {r.status === 'submitted' ? 'Submitted' : 'Draft'}
                </Badge>
              </div>
              <ProgressBar value={r.auto_generated_data?.completionRate || 0} showLabel size="sm" />
            </div>
          ))
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Nama</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Divisi</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Completion</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground p-4">Tanggal Submit</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-sm text-muted-foreground py-12">Belum ada data</td></tr>
            ) : (
              reports.map(r => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/dashboard/laporan-bulanan/${r.id}`)}
                  className="border-b border-border cursor-pointer hover:bg-card/50 transition-colors"
                >
                  <td className="p-4 text-sm font-medium">{r.users?.full_name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{r.divisions?.name}</td>
                  <td className="p-4 w-40"><ProgressBar value={r.auto_generated_data?.completionRate || 0} showLabel size="sm" /></td>
                  <td className="p-4">
                    <Badge variant={r.status === 'submitted' ? 'default' : 'secondary'} className={
                      r.status === 'submitted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''
                    }>
                      {r.status === 'submitted' ? 'Submitted' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
