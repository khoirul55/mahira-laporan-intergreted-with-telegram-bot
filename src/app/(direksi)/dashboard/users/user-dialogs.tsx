'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUser, updateUser, deleteUser } from '@/actions/user'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export function CreateUserDialog({ divisions }: { divisions: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    if (!formData.get('full_name')?.toString().trim()) {
      toast.error('Nama lengkap tidak boleh kosong')
      return
    }
    setLoading(true)
    const res = await createUser(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('User berhasil didaftarkan')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white" />}>
        <Plus className="w-4 h-4 mr-2" />
        Tambah User
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Daftarkan User Baru</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Isi data lengkap untuk mendaftarkan staff atau direksi baru.</p>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" placeholder="Masukkan nama lengkap" required className="bg-background border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="contoh@email.com" required className="bg-background border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Minimal 6 karakter" required className="bg-background border-border" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select name="role" defaultValue="staff">
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="direksi">Direksi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Divisi</Label>
              <Select name="division_id" defaultValue="none">
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Pilih divisi" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {divisions.map(div => (
                    <SelectItem key={div.id} value={div.id.toString()}>{div.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditUserDialog({ user, divisions }: { user: any, divisions: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    if (!formData.get('full_name')?.toString().trim()) {
      toast.error('Nama lengkap tidak boleh kosong')
      return
    }
    formData.append('id', user.id)
    setLoading(true)
    const res = await updateUser(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('User berhasil diupdate')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-foreground hover:text-foreground" />}>
        <Edit2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Ubah data user <span className="font-semibold text-foreground">{user.full_name}</span></p>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input id="full_name" name="full_name" defaultValue={user.full_name} required className="bg-background border-border" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select name="role" defaultValue={user.role}>
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="direksi">Direksi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Divisi</Label>
              <Select name="division_id" defaultValue={user.division_id ? user.division_id.toString() : "none"}>
                <SelectTrigger className="w-full bg-background border-border">
                  <SelectValue placeholder="Pilih divisi" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {divisions.map(div => (
                    <SelectItem key={div.id} value={div.id.toString()}>{div.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status Akun</Label>
            <Select name="is_active" defaultValue={user.is_active ? "true" : "false"}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="true">✅ Aktif</SelectItem>
                <SelectItem value="false">⛔ Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteUserDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    formData.append('id', user.id)
    setLoading(true)
    const res = await deleteUser(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('User berhasil dihapus')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300" />}>
        <Trash2 className="w-4 h-4" />
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Hapus User?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Apakah Anda yakin ingin menghapus <span className="font-bold text-foreground">{user.full_name}</span>? 
            Semua data absen dan laporan miliknya juga akan terhapus. Data ini tidak dapat dikembalikan.
          </p>
        </div>
        <form action={action}>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">
              Batal
            </Button>
            <Button type="submit" disabled={loading} variant="destructive">
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
