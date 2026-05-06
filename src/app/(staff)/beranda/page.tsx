import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from './logout-button'

export default async function BerandaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, role, division:divisions(name)')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Selamat Datang, {userData?.full_name || 'Staff'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {((userData?.division as unknown) as { name: string } | null)?.name || 'Belum ada divisi'} • Staff
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/beranda/laporan" className="p-6 rounded-xl bg-slate-900 border border-emerald-500/30 hover:bg-slate-800 transition-colors group flex flex-col justify-between h-full">
              <div>
                <h2 className="text-lg font-semibold text-emerald-400 group-hover:text-emerald-300">📝 Laporan Harian</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Isi rencana kerja pagi dan update laporan di sore hari.
                </p>
              </div>
              <div className="text-emerald-500 group-hover:text-emerald-400 mt-4 self-end">
                Isi Laporan →
              </div>
            </Link>

            <Link href="/beranda/izin" className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors group flex flex-col justify-between h-full">
              <div>
                <h2 className="text-lg font-semibold text-slate-300 group-hover:text-white">📅 Izin / Absen</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Ajukan absen sakit, cuti, atau dinas luar dan lihat riwayatnya.
                </p>
              </div>
              <div className="text-slate-500 group-hover:text-white mt-4 self-end">
                Ajukan Izin →
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
