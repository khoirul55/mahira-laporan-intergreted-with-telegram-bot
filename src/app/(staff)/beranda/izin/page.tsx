import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { IzinForm, DeleteAbsenceButton } from './izin-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function IzinPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ambil riwayat izin user ini
  const { data: absences } = await supabase
    .from('absences')
    .select('*')
    .eq('user_id', user.id)
    .order('absence_date', { ascending: false })

  const typeMap: Record<string, string> = {
    sakit: 'Sakit',
    cuti: 'Cuti',
    dinas_luar: 'Dinas Luar',
    lainnya: 'Lainnya'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <Link href="/beranda" className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-2xl font-bold">Pengajuan Izin / Absen</h1>
          <p className="text-slate-400 text-sm mt-1">
            Ajukan ketidakhadiran Anda atau status di luar kantor di sini.
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <IzinForm />
        </div>

        {/* Riwayat Container */}
        <div>
          <h2 className="text-xl font-bold mb-4">Riwayat Pengajuan Anda</h2>
          <div className="rounded-md border border-slate-800 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                  <TableHead className="text-slate-400">Tanggal</TableHead>
                  <TableHead className="text-slate-400">Tipe</TableHead>
                  <TableHead className="text-slate-400">Keterangan</TableHead>
                  <TableHead className="text-right text-slate-400">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!absences || absences.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-slate-900/20">
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      Belum ada riwayat izin.
                    </TableCell>
                  </TableRow>
                ) : (
                  absences.map((abs) => (
                    <TableRow key={abs.id} className="border-slate-800 hover:bg-slate-900/20">
                      <TableCell className="font-medium text-slate-300">
                        {new Date(abs.absence_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">
                          {typeMap[abs.type] || abs.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm max-w-[200px] truncate" title={abs.reason}>
                        {abs.reason || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteAbsenceButton id={abs.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  )
}
