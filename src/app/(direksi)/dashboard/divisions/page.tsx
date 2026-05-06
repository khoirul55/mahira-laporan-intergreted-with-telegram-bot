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
import { CreateDivisionDialog, EditDivisionDialog, DeleteDivisionDialog } from './division-dialogs'

export default async function DivisionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'direksi') {
    redirect('/beranda')
  }

  // Fetch divisions
  const { data: divisions } = await supabase
    .from('divisions')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kelola Divisi</h1>
          <p className="text-slate-400 text-sm mt-1">
            Tambah, edit, atau hapus divisi di perusahaan.
          </p>
        </div>
        <CreateDivisionDialog />
      </div>

      <div className="rounded-md border border-slate-800">
        <Table>
          <TableHeader className="bg-slate-900/50">
            <TableRow className="border-slate-800 hover:bg-slate-900/50">
              <TableHead className="w-[50px] text-slate-400">No</TableHead>
              <TableHead className="text-slate-400">Nama Divisi</TableHead>
              <TableHead className="text-slate-400">Deskripsi</TableHead>
              <TableHead className="text-right text-slate-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!divisions || divisions.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-slate-900/20">
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  Belum ada data divisi.
                </TableCell>
              </TableRow>
            ) : (
              divisions.map((div, i) => (
                <TableRow key={div.id} className="border-slate-800 hover:bg-slate-900/20">
                  <TableCell className="font-medium text-slate-300">{i + 1}</TableCell>
                  <TableCell className="font-semibold text-emerald-400">{div.name}</TableCell>
                  <TableCell className="text-slate-400">{div.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditDivisionDialog division={div} />
                      <DeleteDivisionDialog division={div} />
                    </div>
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
