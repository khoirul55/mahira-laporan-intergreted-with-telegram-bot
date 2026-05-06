import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AbsencesPage() {
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

  // Fetch all absences with user details
  const { data: absences } = await supabase
    .from('absences')
    .select('*, user:users(full_name, division:divisions(name))')
    .order('absence_date', { ascending: false })

  const typeMap: Record<string, string> = {
    sakit: 'Sakit',
    cuti: 'Cuti',
    dinas_luar: 'Dinas Luar',
    lainnya: 'Lainnya'
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Rekap Ketidakhadiran (Izin)</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pantau daftar izin sakit, cuti, atau dinas luar dari seluruh staff.
        </p>
      </div>

      <div className="rounded-md border border-slate-800 overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800 hover:bg-slate-900/50">
              <TableHead className="text-slate-400">Tanggal</TableHead>
              <TableHead className="text-slate-400">Nama Staff</TableHead>
              <TableHead className="text-slate-400">Divisi</TableHead>
              <TableHead className="text-slate-400">Tipe</TableHead>
              <TableHead className="text-slate-400">Keterangan / Alasan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!absences || absences.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-900/20">
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  Belum ada data ketidakhadiran / izin.
                </TableCell>
              </TableRow>
            ) : (
              absences.map((abs) => (
                <TableRow key={abs.id} className="border-slate-800 hover:bg-slate-900/20">
                  <TableCell className="font-medium text-slate-300">
                    {new Date(abs.absence_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-400">
                    {(abs.user as any)?.full_name || 'User Terhapus'}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {((abs.user as any)?.division as any)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                      {typeMap[abs.type] || abs.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm max-w-[300px] truncate" title={abs.reason}>
                    {abs.reason || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
