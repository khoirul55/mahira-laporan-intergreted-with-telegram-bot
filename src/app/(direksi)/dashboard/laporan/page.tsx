import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function PantauLaporanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'direksi') {
    redirect('/beranda')
  }

  const today = new Date().toISOString().split('T')[0]

  // 1. Fetch all staff
  const { data: staffs } = await supabase
    .from('users')
    .select('id, full_name, is_active, division:divisions(name)')
    .eq('role', 'staff')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  // 2. Fetch today's reports
  const { data: reports } = await supabase
    .from('daily_reports')
    .select('id, user_id, status, submitted_at')
    .eq('report_date', today)

  // 3. Fetch today's absences
  const { data: absences } = await supabase
    .from('absences')
    .select('user_id, type')
    .eq('absence_date', today)

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pantau Laporan Harian</h1>
        <p className="text-slate-400 text-sm mt-1">
          Status pelaporan kerja seluruh staff untuk hari ini ({new Date(today).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}).
        </p>
      </div>

      <div className="rounded-md border border-slate-800 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800 hover:bg-slate-900/50">
              <TableHead className="text-slate-400">Nama Staff</TableHead>
              <TableHead className="text-slate-400">Divisi</TableHead>
              <TableHead className="text-slate-400">Status Hari Ini</TableHead>
              <TableHead className="text-right text-slate-400">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!staffs || staffs.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-900/20">
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  Belum ada data staff.
                </TableCell>
              </TableRow>
            ) : (
              staffs.map((staff) => {
                const staffReport = reports?.find(r => r.user_id === staff.id)
                const staffAbsence = absences?.find(a => a.user_id === staff.id)

                let statusBadge = <Badge variant="outline" className="text-rose-400 border-rose-400/20 bg-rose-400/10">❌ Belum Buat Rencana</Badge>
                
                if (staffAbsence) {
                  statusBadge = <Badge variant="outline" className="text-cyan-400 border-cyan-400/20 bg-cyan-400/10">🗓️ Izin ({staffAbsence.type.toUpperCase()})</Badge>
                } else if (staffReport?.status === 'submitted') {
                  statusBadge = <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10">✅ Sudah Submit</Badge>
                } else if (staffReport?.status === 'draft') {
                  statusBadge = <Badge variant="outline" className="text-amber-400 border-amber-400/20 bg-amber-400/10">🔄 Draft (Belum Submit)</Badge>
                }

                return (
                  <TableRow key={staff.id} className="border-slate-800 hover:bg-slate-900/20">
                    <TableCell className="font-medium text-slate-200">{staff.full_name}</TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {((staff.division as unknown) as { name: string } | null)?.name || 'Tanpa Divisi'}
                    </TableCell>
                    <TableCell>
                      {statusBadge}
                    </TableCell>
                    <TableCell className="text-right">
                      {staffReport ? (
                        <Link 
                          href={`/dashboard/laporan/${staffReport.id}`}
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Lihat Detail
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-600 italic">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
