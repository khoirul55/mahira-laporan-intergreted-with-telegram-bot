import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTodayWIB } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Redirect staff yang coba akses dashboard direksi
  if (userData?.role !== 'direksi') {
    redirect('/beranda')
  }

  const today = getTodayWIB()

  // Get total active staff
  const { count: totalStaff } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'staff')
    .eq('is_active', true)

  // Get submitted reports today
  const { count: reportsToday } = await supabase
    .from('daily_reports')
    .select('*', { count: 'exact', head: true })
    .eq('report_date', today)
    .eq('status', 'submitted')

  // Get absences today
  const { count: absencesToday } = await supabase
    .from('absences')
    .select('*', { count: 'exact', head: true })
    .eq('absence_date', today)

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Pimpinan 📊</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {userData?.full_name || 'Direksi'} • Overview Sistem
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Staff Aktif</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-500">{totalStaff || 0}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Laporan Masuk Hari Ini</h3>
          <p className="text-3xl font-bold mt-2 text-blue-500">{reportsToday || 0}</p>
        </div>
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Izin Hari Ini</h3>
          <p className="text-3xl font-bold mt-2 text-amber-500">{absencesToday || 0}</p>
        </div>
      </div>
    </div>
  )
}
