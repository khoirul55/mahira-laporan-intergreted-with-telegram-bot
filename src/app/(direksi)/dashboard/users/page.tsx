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
import { CreateUserDialog, EditUserDialog, DeleteUserDialog } from './user-dialogs'

export default async function UsersPage() {
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

  // Fetch users with their divisions
  const { data: users } = await supabase
    .from('users')
    .select('*, division:divisions(id, name)')
    .order('created_at', { ascending: false })

  // Fetch divisions for the forms
  const { data: divisions } = await supabase
    .from('divisions')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Kelola User & Staff</h1>
          <p className="text-secondary-foreground text-sm mt-1">
            Daftarkan akun staff baru, kelola role, dan status aktif.
          </p>
        </div>
        <CreateUserDialog divisions={divisions || []} />
      </div>

      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="border-border hover:bg-card">
              <TableHead className="text-secondary-foreground">Nama Lengkap</TableHead>
              <TableHead className="text-secondary-foreground">Email</TableHead>
              <TableHead className="text-secondary-foreground">Role & Divisi</TableHead>
              <TableHead className="text-secondary-foreground">Status</TableHead>
              <TableHead className="text-right text-secondary-foreground">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!users || users.length === 0 ? (
              <TableRow className="border-border hover:bg-card">
                <TableCell colSpan={5} className="h-24 text-center text-foreground0">
                  Belum ada data user.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className="border-border hover:bg-card">
                  <TableCell className="font-semibold text-foreground">{u.full_name}</TableCell>
                  <TableCell className="text-secondary-foreground">{u.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant={u.role === 'direksi' ? 'default' : 'secondary'} className={u.role === 'direksi' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-muted text-secondary-foreground'}>
                        {u.role.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-secondary-foreground">
                        {((u.division as unknown) as { name: string } | null)?.name || 'Tanpa Divisi'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.is_active ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-rose-400 border-rose-400/20 bg-rose-400/10">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditUserDialog user={u} divisions={divisions || []} />
                      {u.id !== user.id && (
                        <DeleteUserDialog user={u} />
                      )}
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
