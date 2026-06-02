'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAbsence, deleteAbsence } from '@/actions/absence'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export function IzinForm() {
  const [loading, setLoading] = useState(false)

  async function action(formData: FormData) {
    setLoading(true)
    const res = await createAbsence(formData)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Pengajuan izin berhasil dikirim')
      // Reset form via DOM
      ;(document.getElementById('izin-form') as HTMLFormElement)?.reset()
    }
  }

  return (
    <form id="izin-form" action={action} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="absence_date">Tanggal</Label>
          <Input id="absence_date" name="absence_date" type="date" required className="bg-card border-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipe Izin</Label>
          <Select name="type" required>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Pilih tipe..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-white">
              <SelectItem value="sakit">Sakit</SelectItem>
              <SelectItem value="cuti">Cuti</SelectItem>
              <SelectItem value="dinas_luar">Dinas Luar</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Alasan / Keterangan</Label>
        <Textarea id="reason" name="reason" rows={3} placeholder="Sebutkan alasan izin..." className="bg-card border-border" />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
        {loading ? 'Mengirim...' : 'Ajukan Izin'}
      </Button>
    </form>
  )
}

export function DeleteAbsenceButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan ini?')) return
    
    setLoading(true)
    const res = await deleteAbsence(id)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Pengajuan dibatalkan')
    }
  }

  return (
    <Button 
      onClick={handleDelete} 
      disabled={loading} 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-rose-400 hover:text-rose-300"
      title="Batalkan"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
