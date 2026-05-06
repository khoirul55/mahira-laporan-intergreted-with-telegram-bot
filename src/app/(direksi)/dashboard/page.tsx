import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Pimpinan 📊</h1>
        <p className="text-slate-400 text-sm mt-1">
          {userData?.full_name || 'Direksi'} • Overview Sistem
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Placeholder cards for future data */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Total Staff</h3>
          <p className="text-3xl font-bold mt-2 text-emerald-400">...</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Laporan Masuk Hari Ini</h3>
          <p className="text-3xl font-bold mt-2 text-cyan-400">...</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-medium text-slate-400">Izin Pending</h3>
          <p className="text-3xl font-bold mt-2 text-amber-400">...</p>
        </div>
      </div>
    </div>
  )
}
