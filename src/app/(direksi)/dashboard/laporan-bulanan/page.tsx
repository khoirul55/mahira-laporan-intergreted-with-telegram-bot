import { Suspense } from 'react'
import { getAllMonthlyReports } from '@/actions/monthly-report'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MonthlyListClient from './monthly-list-client'

async function MonthlyContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const { data: reports } = await getAllMonthlyReports(now.getMonth() + 1, now.getFullYear())
  const { data: divisions } = await supabase.from('divisions').select('id, name').order('name')

  return (
    <MonthlyListClient
      initialReports={reports || []}
      divisions={divisions || []}
    />
  )
}

export default function LaporanBulananDireksiPage() {
  return (
    <div className="p-4 md:p-6 lg:p-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold">Laporan Bulanan Staff 📊</h1>
        <p className="text-sm text-muted-foreground mt-1">Lihat recap bulanan semua staff</p>
      </div>
      <Suspense fallback={
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />)}
        </div>
      }>
        <MonthlyContent />
      </Suspense>
    </div>
  )
}
