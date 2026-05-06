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
import { Textarea } from '@/components/ui/textarea'
import { createDivision, updateDivision, deleteDivision } from '@/actions/division'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export function CreateDivisionDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    setLoading(true)
    const res = await createDivision(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Divisi berhasil ditambahkan')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Divisi
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Tambah Divisi Baru</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Divisi</Label>
            <Input id="name" name="name" required className="bg-slate-950 border-slate-800" placeholder="Contoh: Operasional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" className="bg-slate-950 border-slate-800" placeholder="Opsional" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditDivisionDialog({ division }: { division: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    formData.append('id', division.id)
    setLoading(true)
    const res = await updateDivision(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Divisi berhasil diupdate')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Divisi</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Divisi</Label>
            <Input id="name" name="name" defaultValue={division.name} required className="bg-slate-950 border-slate-800" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" defaultValue={division.description || ''} className="bg-slate-950 border-slate-800" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteDivisionDialog({ division }: { division: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    formData.append('id', division.id)
    setLoading(true)
    const res = await deleteDivision(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Divisi berhasil dihapus')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Hapus Divisi?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-300">
            Apakah Anda yakin ingin menghapus divisi <span className="font-bold text-white">{division.name}</span>? 
            Data ini tidak dapat dikembalikan.
          </p>
        </div>
        <form action={action}>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 text-slate-300">
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
