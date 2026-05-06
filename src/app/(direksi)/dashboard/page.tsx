import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '../../(staff)/beranda/logout-button'

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
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Dashboard Pimpinan 📊
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {userData?.full_name || 'Direksi'} • Overview Semua Divisi
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4">
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-emerald-400 mb-2">🚧 Dalam Pengembangan</h2>
            <p className="text-slate-400 text-sm">
              Dashboard pimpinan sedang dibangun. Fitur yang akan tersedia:
              overview semua divisi, status laporan, dan statistik.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
